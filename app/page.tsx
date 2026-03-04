import Image from 'next/image';

// Định nghĩa kiểu dữ liệu cho khóa học
interface Course {
  id: number;
  title: string;
  provider: string;
  price: string;
  originalPrice: string;
  image: string;
  affLink: string;
  category: string;
}

// Giả lập dữ liệu từ WordPress CMS - Sẽ được thay thế bằng dữ liệu thật sau này
const featuredCourses: Course[] = [
  {
    id: 1,
    title: "Mastering Next.js & TypeScript 2024",
    provider: "Unica",
    price: "499.000đ",
    originalPrice: "1.200.000đ",
    image: "https://picsum.photos/400/250?random=1",
    affLink: "https://topkhoahoc.online/go/nextjs",
    category: "Lập trình"
  },
  {
    id: 2,
    title: "Marketing Online: Từ cơ bản đến chuyên sâu",
    provider: "Kyna",
    price: "799.000đ",
    originalPrice: "1.500.000đ",
    image: "https://picsum.photos/400/250?random=2",
    affLink: "#",
    category: "Digital Marketing"
  },
  {
    id: 3,
    title: "Học Tiếng Anh giao tiếp cho người đi làm",
    provider: "Edumall",
    price: "299.000đ",
    originalPrice: "900.000đ",
    image: "https://picsum.photos/400/250?random=3",
    affLink: "#",
    category: "Ngoại ngữ"
  },
  {
    id: 4,
    title: "Thiết kế đồ họa với Photoshop & Illustrator",
    provider: "Unica",
    price: "550.000đ",
    originalPrice: "1.300.000đ",
    image: "https://picsum.photos/400/250?random=4",
    affLink: "#",
    category: "Thiết kế"
  },
  {
    id: 5,
    title: "Chuyên gia Data Analytics với Python",
    provider: "Kyna",
    price: "999.000đ",
    originalPrice: "2.000.000đ",
    image: "https://picsum.photos/400/250?random=5",
    affLink: "#",
    category: "Lập trình"
  },
  {
    id: 6,
    title: "Viết nội dung quảng cáo đỉnh cao (Copywriting)",
    provider: "Edumall",
    price: "350.000đ",
    originalPrice: "850.000đ",
    image: "https://picsum.photos/400/250?random=6",
    affLink: "#",
    category: "Digital Marketing"
  },
];

const categories = [
  { name: "Tất cả", icon: "📚" },
  { name: "Lập trình", icon: "👨‍💻" },
  { name: "Ngoại ngữ", icon: "🌎" },
  { name: "Thiết kế", icon: "🎨" },
  { name: "Kinh doanh", icon: "📊" },
  { name: "Digital Marketing", icon: "📢" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* SECTION 1: HEADER & NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-blue-700">TopKhoaHoc.online</h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            <a href="#" className="hover:text-blue-600">Trang chủ</a>
            <a href="#" className="hover:text-blue-600">Tất cả khóa học</a>
            <a href="#" className="hover:text-blue-600">Blog công nghệ</a>
            <a href="#" className="hover:text-blue-600">Liên hệ</a>
          </div>
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition">
            Đăng nhập
          </button>
        </nav>
      </header>

      {/* SECTION 2: HERO (ANH HÙNG) - Sẽ được tối ưu */}
      <section className="bg-white py-24 md:py-32 border-b">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            Khám Phá Hàng Ngàn Khóa Học Tốt Nhất
          </span>
          <h2 className="text-5xl md:text-6xl font-extrabold text-gray-950 leading-tight tracking-tight mb-8">
            Nâng Tầm Kỹ Năng Online Tại <br />
            <span className="text-blue-600">TopKhoaHoc.online</span>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Tổng hợp, so sánh và đánh giá các khóa học từ Unica, Edumall, Kyna và hơn thế nữa. Giúp bạn tìm ra khóa học phù hợp nhất với mức giá tốt nhất.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2">
              Xem ngay các khóa học mới nhất
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button className="bg-gray-100 text-gray-800 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
              Tìm kiếm theo danh mục
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: DANH MỤC KHÓA HỌC */}
      <section className="py-20 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-950 mb-10 text-center">Khám Phá Theo Danh Mục</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <div key={category.name} className="bg-white p-6 rounded-2xl border hover:border-blue-300 hover:shadow-lg transition text-center cursor-pointer">
                <div className="text-5xl mb-4">{category.icon}</div>
                <p className="font-semibold text-gray-800">{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DANH SÁCH KHÓA HỌC NỔI BẬT (COURSE LIST) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-gray-950">Khóa Học Nổi Bật</h3>
            <a href="#" className="text-blue-600 font-medium hover:underline flex items-center gap-1.5">
              Xem tất cả &rarr;
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredCourses.map((course) => (
              <div key={course.id} className="bg-white border rounded-3xl overflow-hidden hover:shadow-xl transition flex flex-col">
                <div className="relative h-56 w-full">
                  <Image 
                    src={course.image} 
                    alt={course.title} 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {course.provider}
                  </div>
                </div>
                
                <div className="p-7 flex flex-col flex-grow">
                  <span className="text-sm font-medium text-blue-600 mb-2.5">{course.category}</span>
                  <h4 className="text-xl font-bold text-gray-950 mb-4 line-clamp-2 flex-grow">{course.title}</h4>
                  
                  <div className="flex items-end justify-between mb-6">
                    <div>
                        <span className="text-sm text-gray-500 line-through mr-2">{course.originalPrice}</span>
                        <span className="text-2xl font-extrabold text-red-500">{course.price}</span>
                    </div>
                  </div>
                  
                  <a 
                    href={course.affLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Xem chi tiết khóa học
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: CALL TO ACTION (CTA) */}
      <section className="bg-gray-950 py-24 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-4xl font-extrabold mb-6">Bạn Vẫn Chưa Tìm Thấy Khóa Học Ưng Ý?</h3>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Chúng tôi cập nhật hàng chục khóa học mới mỗi ngày. Hãy nhập email để nhận ngay danh sách các khóa học được đánh giá cao nhất và mã giảm giá độc quyền.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="flex-grow p-4 rounded-xl bg-gray-800 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-white text-gray-950 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition whitespace-nowrap">
              Đăng ký nhận tin
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 6: FOOTER */}
      <footer className="bg-white py-16 border-t">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p className="font-bold text-blue-700 text-lg mb-4">TopKhoaHoc.online</p>
          <p className="mb-6">Cổng thông tin tổng hợp và so sánh khóa học online hàng đầu Việt Nam.</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-medium">
            <a href="#" className="hover:text-blue-600">Giới thiệu</a>
            <a href="#" className="hover:text-blue-600">Chính sách bảo mật</a>
            <a href="#" className="hover:text-blue-600">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-blue-600">Liên hệ</a>
          </div>
          <p className="text-sm">&copy; {new Date().getFullYear()} TopKhoaHoc.online. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}