'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn, useAuth } from '@clerk/nextjs';
import { Shield } from 'lucide-react';

// =============================
// ===== AdminLogin Component =====
// =============================
export default function AdminLogin() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  // =============================
  // ===== useEffect for Redirect if Already Authenticated =====
  // =============================
  useEffect(() => {
    // Only redirect if user is already signed in and Clerk has loaded
    if (isLoaded && isSignedIn) {
      // Add a small delay to ensure Clerk state is fully updated
      const timer = setTimeout(() => {
        router.replace('/admin');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, router]);

  // =============================
  // ===== Clear cached auth state on login page load =====
  // =============================
  useEffect(() => {
    // Clear any cached authentication state when login page loads
    if (isLoaded && !isSignedIn) {
      // Force a clean state by clearing any stored tokens
      if (typeof window !== 'undefined') {
        // Clear any localStorage items that might be causing issues
        localStorage.removeItem('clerk-db');
        sessionStorage.removeItem('clerk-db');
      }
    }
  }, [isLoaded, isSignedIn]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't show login form if already signed in (redirect will happen)
  if (isSignedIn) {
    return null;
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
        <div className="bg-white shadow-xl rounded-lg p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                card: 'shadow-none',
                headerTitle: 'text-gray-900 text-2xl font-bold',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton:
                  'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
                formFieldInput:
                  'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                formFieldLabel: 'text-gray-700 font-medium',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
                dividerLine: 'bg-gray-300',
                dividerText: 'text-gray-500',
              },
            }}
            // signUpUrl="/admin/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
