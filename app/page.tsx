import { getPosts } from '@/lib/wordpress';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner'; // Dấu @ trỏ về thư mục gốc
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteSection from '@/components/QuoteSection';
import CourseGrid from '@/components/CourseGrid';

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <>
    <Header />
    <section className="container mx-auto px-4 py-12">
      
      <HeroBanner />
      <QuoteSection />
      <CourseGrid posts={posts} />
    </section>
    <Footer/>
    </>
  );
}