'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mybiff:picks';

export default function Home() {
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

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">BIFF 2025 · 전체 영화</h1>
        <div className="text-sm text-gray-400">내 찜: <span className="text-red-500 font-bold">{picks.size}</span>개</div>
      </header>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.films.map(film => {
          const picked = picks.has(film.id);
          return (
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
                    className={`btn ${picked ? 'btn-biff-secondary' : 'btn-biff-primary'} transition-all duration-200`}
                  >
                    {picked ? '찜 해제' : '찜 담기'}
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
          );
        })}
      </ul>
    </div>
  );
}