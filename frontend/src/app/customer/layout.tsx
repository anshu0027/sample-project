'use client';
import { QuoteProvider } from '@/context/QuoteContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressTracker from '@/components/ProgressTracker';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideProgressTracker = pathname && pathname.startsWith('/customer/edit/');
  // Determine if the current page is the first step of the customer quote generation
  const isQuoteGeneratorPage = pathname === '/customer/quote-generator';

  let pageContainerSpecificClasses = 'max-w-5xl mx-auto';
  if (isQuoteGeneratorPage) {
    pageContainerSpecificClasses = 'max-w-[1220px] mx-auto';
  } else {
  //   // For event-information, policy-holder, review pages that show QuotePreview
  //   // Assumes QuotePreview is w-80 (20rem), fixed right-11 (2.75rem from viewport edge),
  //   // and has mr-2 (0.5rem internal margin), for a 3.25rem total offset of its content from viewport edge.
  //   // Form needs right margin: 20rem (preview width) + 3.25rem (preview offset) + 1rem (gap) = 24.25rem.
    pageContainerSpecificClasses = 'max-w-[1220px] mx-auto';
  }

  return (
    <QuoteProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow">
          <div
            className={clsx(
              'px-2 sm:px-6 md:px-12', // Common horizontal paddings for the entire content area
              'pt-6', // Reduced top offset
              pageContainerSpecificClasses, // Page-specific width and margins
            )}
          >
            {!hideProgressTracker && (
              <div className="mb-6 md:mb-8">
                {' '}
                {/* Spacing below ProgressTracker */}
                <ProgressTracker />
              </div>
            )}
            {/* Vertical padding for the page's own content, children pages should not add their own top margin */}
            <div className="py-6 md:py-10">{children}</div>
          </div>
        </main>
        <Footer />
      </div>
    </QuoteProvider>
  );
}
