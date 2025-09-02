'use client';
import { useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [picks, setPicks] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('mybiff:picks') || '[]'));
    } catch { return new Set(); }
  });

  // 데이터 로드
  useEffect(() => {
    fetch('/screenings.json')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  // 저장 동기화
  useEffect(() => {
    localStorage.setItem('mybiff:picks', JSON.stringify([...picks]));
  }, [picks]);

  const filmsById = useMemo(() => {
    const m = new Map();
    if (data?.films) data.films.forEach(f => m.set(f.id, f));
    return m;
  }, [data]);

  const togglePick = (id) => {
    setPicks(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600">로딩 중…</div>;
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">mybiff</h1>
        <div className="text-sm text-gray-600">내 픽: <b>{picks.size}</b>개</div>
      </header>

      <ul className="space-y-3">
        {data.screenings.map(sc => {
          const film = filmsById.get(sc.filmId);
          const picked = picks.has(sc.id);
          return (
            <li key={sc.id} className="border rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{film?.titleKo} <span className="text-gray-500 text-sm">({film?.titleEn})</span></div>
                <div className="text-sm text-gray-600">{sc.start} · {sc.venue} {sc.theater} · 코드 {sc.code}</div>
              </div>
              <button
                onClick={() => togglePick(sc.id)}
                className={`px-3 py-1 rounded-lg text-sm ${picked ? 'bg-gray-200' : 'bg-black text-white'}`}
                aria-pressed={picked}
              >
                {picked ? '해제' : '담기'}
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
