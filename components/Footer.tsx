'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* CỘT 1: THÔNG TIN CHUNG */}
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="inline-block mb-6">
            <Image 
              src="/logotkh.png" 
              alt="TopKhoaHoc Logo" 
              width={180} 
              height={50} 
              className="brightness-0 invert" // Làm logo trắng để nổi bật trên nền đen
            />
          </Link>
          <p className="text-sm leading-relaxed">
            TopKhoaHoc.online - Nền tảng tổng hợp và đánh giá khóa học trực tuyến hàng đầu Việt Nam. Chúng giúp bạn tìm kiếm tri thức phù hợp nhất.
          </p>
        </div>

        {/* CỘT 2: LIÊN KẾT NHANH */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Khám Phá</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/courses" className="hover:text-orange-500 transition">Tất cả khóa học</Link></li>
            <li><Link href="/categories/ngoai-ngu" className="hover:text-orange-500 transition">Học ngoại ngữ</Link></li>
            <li><Link href="/categories/it" className="hover:text-orange-500 transition">Lập trình & IT</Link></li>
            <li><Link href="/categories/marketing" className="hover:text-orange-500 transition">Marketing Online</Link></li>
          </ul>
        </div>

        {/* CỘT 3: CHÍNH SÁCH */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Hỗ Trợ</h3>
          <ul className="space-y-4 text-sm">
            <li><Link href="/about" className="hover:text-orange-500 transition">Giới thiệu</Link></li>
            <li><Link href="/contact" className="hover:text-orange-500 transition">Liên hệ hợp tác</Link></li>
            <li><Link href="/privacy" className="hover:text-orange-500 transition">Chính sách bảo mật</Link></li>
            <li><Link href="/terms" className="hover:text-orange-500 transition">Điều khoản sử dụng</Link></li>
          </ul>
        </div>

        {/* CỘT 4: ĐĂNG KÝ NHẬN TIN */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6">Nhận Ưu Đãi</h3>
          <p className="text-sm mb-4">Để lại email để nhận mã giảm giá khóa học sớm nhất.</p>
          <div className="flex flex-col space-y-2">
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg transition">
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN */}
      <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs">
        <p>© 2024 TopKhoaHoc.online. Tất cả quyền được bảo lưu.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span className="text-gray-500 italic">Thành viên của hệ thống Shopfiliate</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;