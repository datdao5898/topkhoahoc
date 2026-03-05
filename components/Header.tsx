'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO AREA */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logotkh.png" // Đảm bảo bạn đã để file logo vào thư mục public
                alt="TopKhoaHoc Logo"
                width={150}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Trang chủ</Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-medium transition">Khóa học</Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600 font-medium transition">Tin tức</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition">Giới thiệu</Link>
          </nav>

          {/* ACTION BUTTON */}
          <div className="hidden md:block">
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200">
              Đăng ký ngay
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU CONTENT */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link href="/" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Trang chủ</Link>
            <Link href="/courses" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Khóa học</Link>
            <Link href="/blog" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Tin tức</Link>
            <Link href="/about" className="block px-3 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg">Giới thiệu</Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;