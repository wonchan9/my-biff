'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'mybiff:picks';

export default function PicksPage() {
  const [data, setData] = useState(null);
  const [picks, setPicks] = useState(new Set());

  // 로컬 저장된 찜 불러오기
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setPicks(new Set(saved));
    } catch {}
  }, []);

  // 데이터 로드
  useEffect(() => {
    fetch('/screenings.json')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 찜 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...picks]));
  }, [picks]);

  const togglePick = (id) => {
    setPicks(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  if (!data) return <div className="p-4 loading-text">로딩 중…</div>;

  // 찜한 영화들만 필터링
  const pickedFilms = data.films.filter(film => picks.has(film.id));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">내 찜 리스트</h1>
        <div className="text-sm text-gray-400">
          총 <span className="text-red-500 font-bold">{picks.size}</span>개 영화
        </div>
      </header>

      {pickedFilms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">아직 찜한 영화가 없어요</h3>
          <p className="text-gray-500 mb-6">관심있는 영화를 찜해보세요!</p>
          <Link 
            href="/" 
            className="btn btn-biff-primary"
          >
            영화 둘러보기
          </Link>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pickedFilms.map(film => (
            <li key={film.id} className="card bg-gray-900 shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
              <div className="card-body">
                <div className="mb-2">
                  <span className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs">
                    {film.category}
                  </span>
                </div>

                <h2 className="card-title text-white mb-1">
                  {film.titleKo}
                </h2>
                {film.titleEn ? <div className="text-gray-400 text-sm mb-3">{film.titleEn}</div> : null}

                <div className="text-sm text-gray-400 space-y-1">
                  <div>감독: {film.director}</div>
                  <div>제작국가: {film.country}</div>
                </div>

                <div className="card-actions justify-end mt-4 gap-2">
                  <button
                    onClick={() => togglePick(film.id)}
                    className="btn btn-biff-secondary transition-all duration-200"
                  >
                    찜 해제
                  </button>

                  <a
                    href={film.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-biff-outline"
                  >
                    자세히보기
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}