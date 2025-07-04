'use client';
import { QuoteProvider } from '@/context/QuoteContext';
import ProgressTracker from '@/components/ProgressTracker';
// import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

export default function CreateQuoteLayout({ children }: { children: React.ReactNode }) {

  const pageContainerSpecificClasses = 'max-w-5xl mx-auto';
  const [layoutReady, setLayoutReady] = useState(false);

  // ------------------------
  // useEffect hook to manage the initial rendering and display a skeleton loader.
  // This improves perceived performance by showing a placeholder while the layout initializes.
  // ------------------------
  useEffect(() => {
    setLayoutReady(true); // Set layout ready immediately
  }, []); // Empty dependency array ensures this runs once on mount

  // ------------------------
  // Skeleton loader component displayed while `layoutReady` is false.
  // Provides a visual placeholder for the progress tracker and content area.
  // ------------------------
  const LayoutSkeleton = () => (
    <div className="flex flex-col min-h-screen bg-white animate-pulse">
      <main className="flex-grow">
        <div className={clsx('px-2 sm:px-6 md:px-12', 'pt-6', pageContainerSpecificClasses)}>
          {/* ProgressTracker Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="flex justify-around items-center p-4 bg-gray-100 rounded-lg">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-8 w-8 bg-gray-300 rounded-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
          {/* Children Content Skeleton */}
          <div className="py-6 md:py-6 bg-gray-100 rounded-lg p-6">
            <div className="h-10 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </main>
    </div>
  );

  // ------------------------
  // Conditional rendering: Show skeleton if layout is not ready, otherwise render the full layout.
  // ------------------------
  if (!layoutReady) {
    return <LayoutSkeleton />;
  }

  // ------------------------
  // Main layout structure using QuoteProvider for context, a flex container,
  // and a main content area with dynamic classes for padding and width.
  // Includes the ProgressTracker and renders child components (the current step's page).
  // ------------------------
  return (
    <QuoteProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-grow">
          <div
            className={clsx(
              'px-2 sm:px-6 md:px-12', // Common horizontal paddings
              'pt-6', // Reduced top offset
              pageContainerSpecificClasses, // Page-specific width and margins
            )}
          >
            {/* ProgressTracker now a direct child (wrapped for margin) of the width-constrained div */}
            <div className="mb-6 md:mb-8">
              {' '}
              {/* Spacing below ProgressTracker */}
              <ProgressTracker admin />
            </div>
            {/* Children also a direct child (wrapped for padding) of the width-constrained div */}
            <div className="py-6 md:py-6">
              {' '}
              {/* Vertical padding for the page's own content */}
              {children}
            </div>
          </div>
        </main>
      </div>
    </QuoteProvider>
  );
}
