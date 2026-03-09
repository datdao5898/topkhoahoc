'use client';

import React from 'react';
import Link from 'next/link';

interface CourseGridProps {
  posts: any[];
}

const CourseGrid = ({ posts }: CourseGridProps) => {
  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-12 text-center text-[#1E40AF]">
        Khóa Học Mới Nhất
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any) => (
          <article 
            key={post.id} 
            className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Ảnh đại diện khóa học */}
            <Link href={`/courses/${post.slug}`} className="relative h-52 w-full overflow-hidden">
              <img 
                src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://picsum.photos/400/250'} 
                alt={post.title.rendered}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
            </Link>
            
            <div className="p-6 flex flex-col flex-grow">
              {/* Tiêu đề bài viết */}
              <Link href={`/courses/${post.slug}`}>
                <h2 
                  className="text-xl font-bold mb-3 text-gray-900 hover:text-[#1E40AF] transition-colors line-clamp-2 min-h-[3.5rem]"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
              </Link>

              {/* Đoạn trích (Excerpt) */}
              <div 
                className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "Khám phá chi tiết khóa học và nhận ưu đãi affiliate hấp dẫn ngay hôm nay." }} 
              />

              {/* Nút Call to Action */}
              <Link 
                href={`/courses/${post.slug}`}
                className="mt-auto w-full text-center bg-blue-50 text-[#1E40AF] font-bold py-3 rounded-xl hover:bg-[#1E40AF] hover:text-white transition-all shadow-sm"
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CourseGrid;