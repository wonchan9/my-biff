import Link from 'next/link';
import './globals.css';

export const metadata = { title: 'mybiff' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900">
        <nav className="border-b">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 font-medium">
            {/* 내부 이동은 반드시 Link */}
            <Link href="/" className="hover:underline">전체 리스트</Link>
            <Link href="/picks" className="hover:underline">찜 리스트</Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
