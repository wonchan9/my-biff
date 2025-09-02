import './globals.css';
import Link from 'next/link';

export const metadata = { title: 'mybiff' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 font-medium">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">전체 리스트</Link>
            <Link href="/picks" className="text-gray-300 hover:text-white transition-colors">찜 리스트</Link>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}