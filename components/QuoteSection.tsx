'use client'; // Bắt buộc phải có vì component này dùng Client Side cho animation nếu có sau này
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import React from 'react';

const QuoteSection = () => {
  return (
    <section className="bg-eduLight/30 py-20 px-4 border-y border-blue-50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* CỘT 1: CHỨA QUOTE VÀ LỜI KÊU GỌI (LEFT COLUMN) */}
        <div className="flex flex-col justify-center text-center md:text-left">
          {/* Biểu tượng dấu nháy kép cách điệu, căn trái trên md */}
          <div className="text-eduBlue/20 text-8xl font-serif leading-none mb-[-30px] self-center md:self-start">
            “
          </div>
          
          <blockquote className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-eduBlue italic leading-tight mb-8">
              Chuyên gia trong bất kỳ lĩnh vực nào
              cũng từng là <span className="text-eduOrange">người mới bắt đầu.</span>
            </h2>
            
            {/* Thanh gạch dưới, căn trái trên md */}
            <div className="w-24 h-1 bg-eduOrange mb-8 rounded-full mx-auto md:mx-0"></div>
            
          </blockquote>

          
        </div>

        {/* CỘT 2: CHỨA HÌNH ẢNH HOẶC MINH HỌA (RIGHT COLUMN) */}
        <div className="flex items-center justify-center p-6 bg-white rounded-3xl aspect-video md:aspect-square lg:aspect-[4/3]">
          {/* Thẻ placeholder cho hình ảnh. Bạn có thể thay bằng thẻ <Image /> */}
          <div className="md:col-span-6 w-full h-[400px] lg:h-[500px] flex items-center justify-center">
                  <DotLottieReact
                    src="https://lottie.host/d01cface-24d4-458e-b032-ad361e97ebcc/7BtLSf8ayl.lottie"
                    loop
                    autoplay
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
        </div>

      </div>
    </section>
  );
};

export default QuoteSection;