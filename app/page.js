'use client';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'mybiff:picks';

export default function Home() {
  const [data, setData] = useState(null);
  const [picks, setPicks] = useState(new Set());

  // 처음에 picks 로드
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setPicks(new Set(saved));
    } catch { /* noop */ }
  }, []);

  // 데이터 로드
  useEffect(() => {
    fetch('/screenings.json')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 저장 동기화
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...picks]));
  }, [picks]);

  const filmsById = useMemo(() => {
    const m = new Map();
    if (data?.films) data.films.forEach(f => m.set(f.id, f));
    return m;
  }, [data]);

  const togglePick = (screeningId) => {
    setPicks(prev => {
      const next = new Set(prev);
      next.has(screeningId) ? next.delete(screeningId) : next.add(screeningId);
      return next;
    });
  };

  if (!data) return <div>로딩 중…</div>;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">mybiff · 전체 리스트</h1>
        <div className="text-sm text-gray-600">내 찜: <b>{picks.size}</b>개</div>
      </header>

      <ul className="grid sm:grid-cols-2 gap-4">
        {data.screenings.map(sc => {
          const film = filmsById.get(sc.filmId);
          const picked = picks.has(sc.id);
          return (
            <li key={sc.id} className="border rounded-2xl p-3 flex gap-3">
              {/* 포스터 */}
              <a href={film?.detailUrl} target="_blank" rel="noreferrer" className="shrink-0">
                {/* next/image 대신 간단히 img 사용 */}
                <img
                  src={film?.poster}
                  alt={film?.titleKo || 'poster'}
                  className="w-24 h-36 object-cover rounded-xl"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/160x240?text=Poster'; }}
                />
              </a>

              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{film?.titleKo} <span className="text-gray-500">({film?.titleEn})</span></div>
                <div className="text-sm text-gray-600">
                  {new Date(sc.start).toLocaleString()} · {sc.venue} {sc.theater} · 코드 {sc.code}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => togglePick(sc.id)}
                    className={`px-3 py-1 rounded-lg text-sm ${picked ? 'bg-gray-200' : 'bg-black text-white'}`}
                    aria-pressed={picked}
                  >
                    {picked ? '찜 해제' : '찜 담기'}
                  </button>

                  {/* 자세히보기 → BIFF 상세 페이지로 이동 */}
                  <a
                    href={film?.detailUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline text-gray-700"
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
