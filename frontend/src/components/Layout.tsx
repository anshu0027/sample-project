import Header from './Header';
import Footer from './Footer';
import ProgressTracker from './ProgressTracker';

export default function Layout({ children }: { children: React.ReactNode }) {
  // If you want to conditionally show ProgressTracker, you can use usePathname from next/navigation
  // For now, always show it (customize as needed)
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8">
          <ProgressTracker />
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
