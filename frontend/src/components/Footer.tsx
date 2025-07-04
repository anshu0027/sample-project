import React from 'react';
// import { Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

// ------------------------
// Footer component: Displays copyright information and links to legal pages.
// It's a functional component that doesn't manage its own state.
// ------------------------
const Footer: React.FC = () => {
  // ------------------------
  // Get the current year to display in the copyright notice.
  // ------------------------
  const currentYear = new Date().getFullYear();

  return (
    // ------------------------
    // Main footer container.
    // Uses Tailwind CSS for styling: dark blue background, white text, padding.
    // ------------------------
    <footer className="bg-blue-900 text-white pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* ------------------------ */}
        {/* Commented out section: This part of the footer, which included logo, quick links, and contact info, is currently disabled. */}
        {/* It can be re-enabled by removing the comment tags. */}
        {/* ------------------------ */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
             <div className="flex items-center gap-2 mb-4">
              <img src="/logo.svg" alt="Logo" width="50" height="50" />
              <h2 className="font-bold text-lg text-white/90">Wedding & Event</h2>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed">
              Comprehensive insurance coverage for your special day, providing peace of mind when you need it most.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white/90">Quick Links</h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">•</span>About Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">•</span>Coverage Details
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">•</span>FAQ
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">•</span>Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">•</span>Claims
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white/90">Contact</h3>
            <ul className="space-y-3 text-sm text-blue-200">
              <li className="flex items-center">
                <Phone size={16} className="mr-2 flex-shrink-0" />
                <span>1-800-555-0123</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2 flex-shrink-0" />
                <span>support@weddingguard.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>123 Insurance Plaza, Suite 101<br />New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div> */}

        {/* ------------------------ */}
        {/* Bottom section of the footer. */}
        {/* Displays copyright information and links to Privacy Policy, Terms of Service, and Licenses. */}
        {/* Uses flexbox for layout, adjusting for different screen sizes (md:flex-row). */}
        {/* ------------------------ */}
        <div className=" border-blue-300 mt-6 pt-6 text-sm text-blue-300 flex flex-col md:flex-row justify-between">
          {' '}
          {/* border-t-2*/}
          <p>&copy; {currentYear} Wedevent Insurance. All rights reserved.</p>
          {/* ------------------------ */}
          {/* Links to legal pages. */}
          {/* Arranged horizontally with spacing, stacking vertically on smaller screens. */}
          {/* ------------------------ */}
          <div className="space-x-4 mt-2 md:mt-0">
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-white transition-colors duration-200">
              Licenses
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
