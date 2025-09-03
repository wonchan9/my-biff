'use client';
import { useEffect, useState } from 'react';
import { Heart, ExternalLink } from 'lucide-react';

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

  if (!data) return <div className="loading-text">로딩 중…</div>;

  return (
    <div className="space-y-6">
      {/* 헤더 정보 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">BIFF 2025</h1>
        <p className="text-gray-400">부산국제영화제 상영작 리스트</p>
        <div className="text-sm text-gray-500 mt-2">
          전체 <span className="text-white font-semibold">{data.films?.length || 0}</span>편 | 
          찜한 영화 <span className="text-red-500 font-semibold">{picks.size}</span>편
        </div>
      </div>

      {/* 영화 리스트 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.films?.map(film => {
          const picked = picks.has(film.id);
          const categoryInfo = data.categories?.[film.categoryId];
          const subCategoryName = categoryInfo?.subcategories?.[film.subCategoryId];
          
          return (
            <div key={film.id} className="card bg-gray-900 shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
              <div className="card-body">
                {/* 카테고리 뱃지 */}
                <div className="mb-3">
                  <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {categoryInfo?.name || '미분류'}
                  </span>
                  {subCategoryName && (
                    <span className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs ml-2">
                      {subCategoryName}
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <h2 className="card-title text-white mb-1 text-lg">
                  {film.titleKo}
                </h2>
                {film.titleEn && (
                  <div className="text-gray-400 text-sm mb-3 font-light">
                    {film.titleEn}
                  </div>
                )}

                {/* 영화 정보 */}
                <div className="text-sm text-gray-400 space-y-1 mb-4">
                  <div><span className="text-gray-500">감독:</span> {film.director}</div>
                  <div><span className="text-gray-500">제작:</span> {film.country}</div>
                  {film.year && (
                    <div><span className="text-gray-500">연도:</span> {film.year}</div>
                  )}
                  {film.runtime && (
                    <div><span className="text-gray-500">상영시간:</span> {film.runtime}</div>
                  )}
                </div>

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-between mt-auto">
                  {/* 찜하기 하트 버튼 */}
                  <button
                    onClick={() => togglePick(film.id)}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      picked 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-500'
                    }`}
                    title={picked ? '찜 해제' : '찜하기'}
                  >
                    <Heart 
                      className={`w-5 h-5 ${picked ? 'fill-current' : ''}`} 
                    />
                  </button>

                  {/* 자세히보기 버튼 */}
                  {film.detailUrl && (
                    <a
                      href={film.detailUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <span>자세히</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 데이터 없을 때 */}
      {!data?.films?.length && (
        <div className="text-center py-12 text-gray-500">
          영화 데이터를 불러올 수 없습니다.
        </div>
      )}
    </div>
  );
}