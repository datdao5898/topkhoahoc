'use client';

import React from 'react';
import Link from 'next/link';

const CategorySection = () => {
  const categories = [
    {
      title: "Lập trình & IT",
      slug: "lap-trinh-it",
      icon: "/developer.png",
      color: "bg-blue-50 text-blue-600",
      description: "Web, App, Data Science"
    },
    {
      title: "Ngoại ngữ",
      slug: "ngoai-ngu",
      icon: "/elearning.png",
      color: "bg-orange-50 text-orange-600",
      description: "Tiếng Anh, Nhật, Trung"
    },
    {
      title: "Marketing",
      slug: "digital-marketing",
      icon: "/marketing.png",
      color: "bg-green-50 text-green-600",
      description: "Facebook, SEO, Content"
    },
    {
      title: "Thiết kế",
      slug: "thiet-ke-do-hoa",
      icon: "/graphic-designer.png",
      color: "bg-purple-50 text-purple-600",
      description: "Photoshop, AI, UI/UX"
    },
    {
      title: "Kinh doanh",
      slug: "kinh-doanh-khoi-nghiep",
      icon: "/earning.png",
      color: "bg-red-50 text-red-600",
      description: "Bán hàng, Khởi nghiệp"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
       

        {/* Cấu trúc 5 cột: grid-cols-2 (mobile), grid-cols-3 (tablet), grid-cols-5 (desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center p-8 rounded-3xl border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 bg-white hover:-translate-y-2"
            >
              {/* Icon Circle */}
              <div className={` rounded-2xl ${cat.color} flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform`}>
                <img 
                  src={cat.icon} 
                  alt={cat.title}
                  className="w-full h-full object-contain"
                />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1E40AF] transition-colors">
                {cat.title}
              </h3>
              
              <p className="text-sm text-gray-400 text-center leading-tight">
                {cat.description}
              </p>
              
              {/* Mũi tên nhỏ ẩn hiện khi hover */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#1E40AF]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;