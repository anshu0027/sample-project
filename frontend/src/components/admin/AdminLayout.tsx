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
import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ------------------------
  // Get current pathname and router instance from Next.js navigation.
  // ------------------------
  const pathname = usePathname();
  const router = useRouter();

  // ------------------------
  // Clerk authentication hooks
  // ------------------------
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  // ------------------------
  // State for managing mobile sidebar visibility.
  // ------------------------
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ------------------------
  // Handle sign out
  // ------------------------
  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: '/admin/login' });
      // Force a hard redirect to clear any cached state
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback redirect even if signOut fails
      window.location.href = '/admin/login';
    }
  };

  // ------------------------
  // Check authentication and redirect if needed
  // ------------------------
  useEffect(() => {
    if (isLoaded && !isSignedIn && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  // ------------------------
  // Show loading spinner while Clerk is loading
  // ------------------------
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  // ------------------------
  // If not signed in and not on login page, don't render anything (redirect handled in useEffect)
  // ------------------------
  if (!isSignedIn && pathname !== '/admin/login') {
    return null;
  }

  // ------------------------
  // If on login page, just render children without layout
  // ------------------------
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Policies', href: '/admin/policies', icon: Shield },
    { name: 'Generate Policy', href: '/admin/create-quote/step1', icon: PlusCircle },
    { name: 'Quotes', href: '/admin/quotes', icon: Clock },
    { name: 'Transactions', href: '/admin/transactions', icon: DollarSign },
  ];
  // ------------------------
  // Main layout structure. Includes sidebar and main content area.
  // ------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {isSignedIn && (
        <>
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-2">
            <button
              // ------------------------
              // Toggles the mobile sidebar visibility.
              // ------------------------
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {/* Sidebar */}
          <div
            // ------------------------
            // Sidebar container with responsive visibility and transition.
            // ------------------------
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
          >
            <div className="h-full flex flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
                {/* <Shield size={24} className="text-blue-600" /> */}
                {/* ------------------------ */}
                {/* Admin portal logo and title. */}
                {/* ------------------------ */}
                <Image
                  src="/logo.png"
                  alt="Wedevent Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8" // Adjust size as needed, 24px is h-6 w-6 in Tailwind
                />
                <div>
                  <h1 className="font-bold text-xl text-gray-800 leading-none">Wedevent </h1>
                  <p className="text-xs text-gray-500 leading-none">Admin Portal</p>
                </div>
              </div>
              {/* Navigation */}
              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {/* ------------------------ */}
                {/* Maps through the navigation items to create links. */}
                {/* Highlights the active link based on the current pathname. */}
                {/* Closes mobile sidebar on link click. */}
                {/* ------------------------ */}
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
                      onMouseEnter={() => router.prefetch(item.href)}
                      // ------------------------
                      // Dynamically sets class names for active and hover states.
                      // ------------------------
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
                {/* ------------------------ */}
                {/* Displays admin user information and logout button. */}
                {/* ------------------------ */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || 'Admin User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <Users size={20} className="text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.primaryEmailAddress?.emailAddress || 'admin@weddingguard.com'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Main content */}
      <div className={`${isSignedIn ? 'lg:pl-64' : ''} pt-14 lg:pt-0 min-h-screen bg-gray-50`}>
        {/* ------------------------ */}
        {/* Renders the children components (page content). */}
        {/* Adjusts left padding based on sidebar visibility for logged-in users. */}
        {/* ------------------------ */}
        {children}
      </div>
    </div>
  );
}
