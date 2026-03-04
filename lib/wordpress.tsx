// lib/wordpress.ts

const BASE_URL = 'https://shopfiliate.shop/wp-json/wp/v2';

export async function getPosts() {
  // Lấy danh sách bài viết từ category "courses" (ví dụ ID category là 1)
  // _embed giúp lấy thêm ảnh đại diện (Featured Image)
  const res = await fetch(`${BASE_URL}/posts?categories=194&_embed&per_page=6`, {
    next: { revalidate: 3600 }, // Cache dữ liệu trong 1 giờ
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export async function getPostBySlug(slug: string) {
  const res = await fetch(`${BASE_URL}/posts?slug=${slug}&_embed`);
  const posts = await res.json();
  return posts[0]; // Trả về bài viết đầu tiên tìm thấy
}