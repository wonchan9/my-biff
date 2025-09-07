import './globals.css';
import Link from 'next/link';
import { Heart, Calendar } from 'lucide-react';

export const metadata = { title: 'mybiff' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">
        {/* 메인 컨텐츠 - 헤더 높이만큼 여백 */}
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}