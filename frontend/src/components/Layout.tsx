import Header from './Header';
import Footer from './Footer';
import ProgressTracker from './ProgressTracker';
// ------------------------
// Layout component: Provides the basic structure for pages in the application.
// It includes a Header, Footer, and a ProgressTracker.
// The main content of each page is rendered as children within this layout.
//
// Props:
// - children: React.ReactNode - The content to be rendered within the main section of the layout.
// ------------------------
export default function Layout({ children }: { children: React.ReactNode }) {
  // If you want to conditionally show ProgressTracker, you can use usePathname from next/navigation
  // For now, always show it (customize as needed)
  return (
    // ------------------------
    // Main container for the entire page layout.
    // Uses flexbox to ensure the footer stays at the bottom of the screen even on short pages.
    // Sets a minimum height of the screen and a white background.
    // ------------------------
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      {/* ------------------------ */}
      {/* Main content area of the page. */}
      {/* 'flex-grow' allows this section to take up available vertical space. */}
      {/* ------------------------ */}
      <main className="flex-grow">
        {/* ------------------------ */}
        {/* Inner container for the main content, providing max-width, centering, and padding. */}
        {/* Includes the ProgressTracker and the page-specific children components. */}
        {/* ------------------------ */}
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          <ProgressTracker />
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
