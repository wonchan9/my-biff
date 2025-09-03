import './globals.css';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export const metadata = { title: 'mybiff' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-black text-white">
        {/* 고정 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-white hover:text-red-500 transition-colors">
              BIFF 2025
            </Link>
            
            <Link 
              href="/picks" 
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              title="찜 리스트"
            >
              <Heart className="w-6 h-6 text-red-500" />
            </Link>
          </div>
        </header>

        {/* 메인 컨텐츠 - 헤더 높이만큼 여백 */}
        <main className="pt-20 max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}