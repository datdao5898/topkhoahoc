'use client';

import React from 'react';

const SimpleQuote = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Đường kẻ trang trí phía trên */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <div className="h-[1px] w-12 bg-gray-200"></div>
          <span className="text-[#F59E0B] text-2xl">✦</span>
          <div className="h-[1px] w-12 bg-gray-200"></div>
        </div>

        <blockquote className="relative">
          <p className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-800 leading-relaxed italic">
            “Người không học cũng giống như <span className="text-[#1E40AF] font-bold">người mù</span> đi trên đường đầy sỏi đá; họ sẽ vấp ngã liên tục mà không hiểu tại sao.”
          </p>
          
          <footer className="mt-8">
            <div className="w-16 h-1 bg-[#F59E0B] mx-auto mb-4 rounded-full"></div>
            <cite className="text-gray-500 font-semibold uppercase tracking-[0.2em] text-sm not-italic">
              Danh ngôn Do Thái
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  );
};

export default SimpleQuote;