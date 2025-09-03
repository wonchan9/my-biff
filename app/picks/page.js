'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ExternalLink, ArrowLeft } from 'lucide-react';

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

  if (!data) return <div className="loading-text">로딩 중…</div>;

  // 찜한 영화들만 필터링
  const pickedFilms = data.films?.filter(film => picks.has(film.id)) || [];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link 
          href="/" 
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          title="전체 리스트로 돌아가기"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-current" />
            내 찜 리스트
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            총 <span className="text-red-500 font-semibold">{picks.size}</span>개의 영화를 찜했습니다
          </p>
        </div>
      </div>

      {/* 찜한 영화가 없을 때 */}
      {pickedFilms.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <Heart className="w-16 h-16 mx-auto text-gray-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-400 mb-3">아직 찜한 영화가 없어요</h3>
          <p className="text-gray-500 mb-8">관심있는 영화에 하트를 눌러 찜해보세요!</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <Heart className="w-4 h-4" />
            영화 둘러보기
          </Link>
        </div>
      ) : (
        /* 찜한 영화 리스트 */
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pickedFilms.map(film => {
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
                    {/* 찜 해제 하트 버튼 */}
                    <button
                      onClick={() => togglePick(film.id)}
                      className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
                      title="찜 해제"
                    >
                      <Heart className="w-5 h-5 fill-current" />
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
      )}

      {/* 찜한 영화가 있을 때 하단 액션 */}
      {pickedFilms.length > 0 && (
        <div className="text-center pt-8 border-t border-gray-800">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 hover:text-white transition-colors"
          >
            더 많은 영화 찾기
          </Link>
        </div>
      )}
    </div>
  );
}