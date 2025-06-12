import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  Users,
  LogOut,
  Menu,
  X,
  PlusCircle,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    // Always check on mount and on route change
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
      setIsLoggedIn(loggedIn);
      setAuthChecked(true);
      if (pathname !== '/admin/login' && !loggedIn) {
        router.replace('/admin/login');
      }
    };
    checkAuth();
    // Listen for storage changes (e.g., logout in another tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'admin_logged_in') {
        checkAuth();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [pathname, router]);

  if (typeof window === 'undefined' || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></span>
      </div>
    );
  }
  if (!isLoggedIn && pathname !== '/admin/login') {
    return null;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Policies', href: '/admin/policies', icon: Shield },
    { name: 'Generate Policy', href: '/admin/create-quote/step1', icon: PlusCircle },
    { name: 'Quotes', href: '/admin/quotes', icon: Clock },
    { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  ];
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_logged_in');
      window.location.href = '/admin/login';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {isLoggedIn && (
        <>
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                {/* <Shield size={24} className="text-blue-600" /> */}
                <img
                  src="/logo.png"
                  alt="Wedevent Focalat Logo"
                  className="h-8 w-8" // Adjust size as needed, 24px is h-6 w-6 in Tailwind
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-800 leading-none">Wedevent </h1>
                  <p className="text-xs text-gray-500 leading-none">Admin Portal</p>
                </div>
              </div>
              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              {/* User section */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
                    <p className="text-xs text-gray-500">admin@weddingguard.com</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  //
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Main content */}
      <div className={`${isLoggedIn ? 'lg:pl-64' : ''} pt-14 lg:pt-0 min-h-screen bg-gray-50`}>
        {children}
      </div>
    </div>
  );
}
