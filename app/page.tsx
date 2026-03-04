import Image from 'next/image';

// Định nghĩa kiểu dữ liệu cho khóa học
interface Course {
  id: number;
  title: string;
  provider: string;
  price: string;
  image: string;
  affLink: string;
}

const featuredCourses: Course[] = [
  {
    id: 1,
    title: "Khóa học Next.js Fullstack 2024",
    provider: "Unica",
    price: "499.000đ",
    image: "https://picsum.photos/400/250",
    affLink: "https://topkhoahoc.online/go/nextjs"
  },
  {
    id: 2,
    title: "Mastering Marketing Online",
    provider: "Kyna",
    price: "799.000đ",
    image: "https://picsum.photos/400/251",
    affLink: "#"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header đơn giản */}
      <nav className="p-6 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">TopKhoaHoc.online</h1>
        <div className="space-x-4 text-gray-600">
          <a href="#" className="hover:text-blue-600">Khóa học</a>
          <a href="#" className="hover:text-blue-600">Blog</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 text-center">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
          Học kỹ năng mới mỗi ngày
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tổng hợp những khóa học tốt nhất từ các nền tảng giáo dục hàng đầu.
        </p>
      </section>

      {/* Course List */}
      <section className="max-w-6xl mx-auto py-16 px-4">
        <h3 className="text-2xl font-bold mb-8">Khóa học nổi bật</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => (
            <div key={course.id} className="border rounded-2xl overflow-hidden hover:shadow-lg transition">
              <div className="bg-gray-200 h-48 relative">
                <img src={course.image} alt={course.title} className="object-cover w-full h-full" />
              </div>
              <div className="p-5">
                <span className="text-sm font-medium text-blue-500 uppercase">{course.provider}</span>
                <h4 className="text-lg font-bold my-2">{course.title}</h4>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-red-500">{course.price}</span>
                  <a 
                    href={course.affLink}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Xem chi tiết
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}