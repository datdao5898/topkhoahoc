import { getPostBySlug } from "@/lib/wordpress";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return <div className="p-20 text-center">Khóa học không tồn tại.</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Tiêu đề bài viết */}
      <h1 
        className="text-4xl font-extrabold mb-8 text-gray-900"
        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
      />
      
      {/* Nội dung chi tiết từ WordPress */}
      <div 
        className="prose prose-blue max-w-none shadow-sm bg-white p-8 rounded-2xl border"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
      />
    </main>
  );
}