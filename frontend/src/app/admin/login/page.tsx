'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// const ADMIN_EMAIL = "admin@weddingguard.com";
// const ADMIN_PASS = "admin123";

// =============================
// ===== AdminLogin Component =====
// =============================
export default function AdminLogin() {
  const router = useRouter();
  // =============================
  // ===== Component State =====
  // =============================
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // =============================
  // ===== API Base URL =====
  // =============================
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  // =============================
  // ===== useEffect for Authentication Check and Page Loading =====
  // =============================
  useEffect(() => {
    let isMounted = true;
    // Check if admin is already logged in. This runs client-side.
    if (localStorage.getItem('admin_logged_in') === 'true') {
      router.replace('/admin'); // This will unmount the component
      // No need to setPageLoading(false) if redirecting
    } else {
      // Simulate a brief loading period for UX if not redirecting
      const timer = setTimeout(() => {
        if (isMounted) {
          setPageLoading(false);
        }
      }, 200); // Adjust delay as needed
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [router]); // Include router as it's used. replace() will unmount.

  // =============================
  // ===== Login Handler =====
  // =============================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }
    // =============================
    // ===== API Call for Login =====
    // =============================
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: email, password: password }),
      });

      // =============================
      // ===== Handle API Response =====
      // =============================
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      // =============================
      // ===== Handle Successful Login =====
      // =============================
      if (data.success) {
        localStorage.setItem('admin_logged_in', 'true');
        router.replace(data.route || '/admin');
        // =============================
        // ===== Handle Failed Login =====
        // =============================
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      console.error('Login error:', err);
    }
    setIsSubmitting(false);
  };

  // =============================
  // ===== Skeleton Component for Login Page =====
  // =============================
  const LoginSkeleton = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 animate-pulse">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
        </div>
        <div className="mt-6 h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
        <div className="mt-2 h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-12 bg-blue-300 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // =============================
  // ===== Render Skeleton if Page is Loading =====
  // =============================
  if (pageLoading) {
    return <LoginSkeleton />;
  }

  // =============================
  // ===== Main Component Render =====
  // =============================
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-full shadow-lg">
            <Shield size={48} className="text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access the admin dashboard
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white shadow-xl">
          {/* ============================= */}
          {/* ===== Login Form ===== */}
          {/* ============================= */}
          <form onSubmit={handleLogin} className="space-y-6 p-6">
            {/* ============================= */}
            {/* ===== Error Message Display ===== */}
            {/* ============================= */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {/* ============================= */}
            {/* ===== Email Input Field ===== */}
            {/* ============================= */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={16} />}
                  placeholder="Admin Email"
                  className="w-full"
                />
              </div>
              {/* ============================= */}
              {/* ===== Password Input Field ===== */}
              {/* ============================= */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={16} />}
                  placeholder="••••••••"
                  className="w-full"
                />
              </div>
            </div>
            <div className="pt-2">
              {/* ============================= */}
              {/* ===== Submit Button ===== */}
              {/* ============================= */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                onMouseEnter={() => router.prefetch('/admin')}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
