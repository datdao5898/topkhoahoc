import { getPosts } from '@/lib/wordpress';
import Link from 'next/link';

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <section className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-10 text-center">Khóa Học Mới Nhất</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* BẮT ĐẦU VÒNG LẶP */}
        {posts.map((post: any) => (
          <article 
            key={post.id} 
            className="flex flex-col bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Ảnh đại diện khóa học */}
            <Link href={`/courses/${post.slug}`} className="relative h-48 w-full group overflow-hidden">
              <img 
                src={post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://picsum.photos/400/250'} 
                alt={post.title.rendered}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </Link>
            
            <div className="p-6 flex flex-col flex-grow">
              {/* Tiêu đề bài viết - Chỉ dùng 1 thẻ h2 để tối ưu SEO */}
              <Link href={`/courses/${post.slug}`}>
                <h2 
                  className="text-xl font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
              </Link>

              {/* Đoạn trích (Excerpt) */}
              <div 
                className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow"
                dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "Khám phá chi tiết khóa học và nhận ưu đãi affiliate hấp dẫn ngay hôm nay." }} 
              />

              {/* Nút Call to Action */}
              <Link 
                href={`/courses/${post.slug}`}
                className="mt-auto w-full text-center bg-blue-50 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                Xem chi tiết
              </Link>
            </div>
          </article>
        ))}
        {/* KẾT THÚC VÒNG LẶP */}
      </div>
    </section>
  );
}