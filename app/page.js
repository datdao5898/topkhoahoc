import Image from 'next/image';
import Link from 'next/link';

// Giả lập dữ liệu từ WordPress CMS
const featuredCourses = [
  {
    id: 1,
    title: "Khóa học Next.js từ cơ bản đến nâng cao",
    provider: "Unica",
    price: "499.000đ",
    image: "https://picsum.photos/400/250",
    affLink: "https://unica.vn/link-affiliate-cua-ban"
  },
  {
    id: 2,
    title: "Mastering Marketing Online 2024",
    provider: "Kyna",
    price: "799.000đ",
    image: "https://picsum.photos/400/251",
    affLink: "#"
  },
  {
    id: 3,
    title: "Học Tiếng Anh giao tiếp cho người đi làm",
    provider: "Edumall",
    price: "299.000đ",
    image: "https://picsum.photos/400/252",
    affLink: "#"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. HERO SECTION */}
      <section className="bg-blue-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Tìm Kiếm Khóa Học Tốt Nhất Tại <span className="text-yellow-400">TopKhoaHoc</span>
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Tổng hợp và đánh giá hàng ngàn khóa học online từ các nền tảng uy tín nhất.
          </p>
          <div className="max-w-2xl mx-auto flex">
            <input 
              type="text" 
              placeholder="Bạn muốn học gì hôm nay?" 
              className="w-full p-4 rounded-l-lg text-gray-800 focus:outline-none"
            />
            <button className="bg-yellow-500 hover:bg-yellow-400 px-8 py-4 rounded-r-lg font-bold transition">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES SECTION */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Khóa Học Nổi Bật</h2>
            <p className="text-gray-500">Được cộng đồng đánh giá cao nhất</p>
          </div>
          <Link href="/courses" className="text-blue-600 hover:underline font-medium">
            Xem tất cả &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
              <div className="relative h-48 w-full">
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded uppercase">
                  {course.provider}
                </span>
                <h3 className="text-xl font-bold mt-3 mb-2 text-gray-800 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-600 font-bold text-lg">{course.price}</span>
                  <a 
                    href={course.affLink} 
                    target="_blank" 
                    rel="nofollow"
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Đến Khóa Học
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section className="bg-gray-800 py-16 text-white mt-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Bạn chưa tìm thấy khóa học ưng ý?</h2>
          <p className="mb-8 opacity-80">Đừng lo, chúng tôi cập nhật các khóa học mới mỗi ngày từ WordPress.</p>
          <button className="bg-white text-gray-800 px-10 py-3 rounded-full font-bold hover:bg-gray-100 transition">
            Liên hệ tư vấn
          </button>
        </div>
      </section>
    </div>
  );
}