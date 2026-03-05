'use client'; // Bắt buộc phải có vì Lottie chạy phía Client

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const HeroBanner = () => {
  return (
    // Sử dụng grid-cols-10 để dễ dàng chia tỷ lệ 4 và 6
    <div className="grid grid-cols-1 md:grid-cols-10 gap-8 items-center py-10 px-4 max-w-7xl mx-auto">
      
      {/* Cột 1: Giới thiệu - Chiếm 4 phần (col-span-4) */}
      <div className="md:col-span-4 flex flex-col justify-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 text-gray-900 leading-tight">
        <span className="text-blue-600">Mỗi giờ học tập có thể củng cố hàng nghìn liên kết thần kinh mới</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          
        </p>
        <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-all self-start shadow-lg">
          Khám phá ngay
        </button>
      </div>
      
      {/* Cột 2: Animation Lottie - Chiếm 6 phần (col-span-6) */}
      <div className="md:col-span-6 w-full h-[400px] lg:h-[500px] flex items-center justify-center">
        <DotLottieReact
          src="https://lottie.host/43640e9c-cfa3-4455-96fd-e4e8057b52ac/eVI4Cjh6pR.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>

    </div>
  );
};

export default HeroBanner;