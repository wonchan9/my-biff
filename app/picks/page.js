'use client';
import { useEffect, useMemo, useState } from 'react';
const STORAGE_KEY = 'mybiff:picks';

export default function PicksPage() {
  const [data, setData] = useState(null);
  const [picks, setPicks] = useState(new Set());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setPicks(new Set(saved));
    } catch {}
  }, []);

  useEffect(() => {
    fetch('/screenings.json').then(r => r.json()).then(setData);
  }, []);

  const filmsById = useMemo(() => {
    const m = new Map();
    if (data?.films) data.films.forEach(f => m.set(f.id, f));
    return m;
  }, [data]);

  if (!data) return <div>로딩 중…</div>;

  const pickedScreenings = data.screenings.filter(sc => picks.has(sc.id));

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 찜 리스트</h1>
        <div className="text-sm text-gray-600">총 <b>{pickedScreenings.length}</b>개</div>
      </header>

      {pickedScreenings.length === 0 ? (
        <div className="text-gray-600">아직 담은 상영이 없어요. <a className="underline" href="/">전체 리스트</a>에서 담아보세요.</div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {pickedScreenings.map(sc => {
            const film = filmsById.get(sc.filmId);
            return (
              <li key={sc.id} className="border rounded-2xl p-3 flex gap-3">
                <a href={film?.detailUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  <img src={film?.poster} alt={film?.titleKo || 'poster'} className="w-24 h-36 object-cover rounded-xl" loading="lazy" />
                </a>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{film?.titleKo} <span className="text-gray-500">({film?.titleEn})</span></div>
                  <div className="text-sm text-gray-600">
                    {new Date(sc.start).toLocaleString()} · {sc.venue} {sc.theater} · 코드 {sc.code}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
