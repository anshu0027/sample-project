import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

// ------------------------
// Header component: Displays the site logo and contact information.
// It's a functional component that doesn't manage its own state.
// ------------------------
const Header: React.FC = () => {
  return (
    // ------------------------
    // Main header container.
    // Uses Tailwind CSS for styling: white background, shadow, sticky positioning at the top, and z-index.
    // ------------------------
    <header className="bg-white shadow-sm sticky top-0 z-10">
      {/* ------------------------ */}
      {/* Inner container for content alignment and padding. */}
      {/* Max width, centered, horizontal padding, vertical padding, flex layout for items. */}
      {/* ------------------------ */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* ------------------------ */}
        {/* Logo and site title section. */}
        {/* Links to the homepage. */}
        {/* ------------------------ */}
        <Link
          href="/"
          className="flex items-center gap-2 text-black-600 hover:text-black-700 transition"
        >
          <Image src="/logo.svg" alt="Logo" width="50" height="50" />
        </Link>
        {/* ------------------------ */}
        {/* Contact information section. */}
        {/* Includes a "Need assistance?" text and a clickable phone number. */}
        {/* ------------------------ */}
        <div className="flex items-center gap-4">
          <span className="hidden md:inline-block text-sm text-gray-600">Need assistance?</span>
          <a
            href="tel:1-800-555-0123"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            1-800-555-0123
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
