import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-black-600 hover:text-black-700 transition">
          <img src="/logo.svg" alt="Logo" width="50" height="50" />
          {/* <div>
            <h1 className="font-bold text-xl leading-none">Wedding & Event</h1>
            <p className="text-xs text-gray-500 leading-none">Special Event Insurance</p>
          </div> */}
        </Link>
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
}

export default Header;