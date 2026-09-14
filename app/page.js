'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ExternalLink, Plus, Calendar } from 'lucide-react';
import { AVAILABLE_YEARS, DEFAULT_YEAR, getStoredYear, setStoredYear } from '@/lib/utils';
import { useBiffData } from '@/lib/useBiffData';
import SchedulePopup from '@/components/SchedulePopup';
import AuthControl from '@/components/AuthControl';

export default function Home() {
  // 상태 관리
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [films, setFilms] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const { picks, mySchedule, togglePick, addToMySchedule } = useBiffData(year);

  // 회차(연도) 로드
  useEffect(() => {
    setYear(getStoredYear());
  }, []);

  // 영화 데이터 로드
  useEffect(() => {
    if (!year) return;
    setFilms(null);
    fetch(`/screenings-${year}.json`)
      .then(r => r.json())
      .then(setFilms)
      .catch(console.error);
  }, [year]);

  // 스케줄 데이터 로드
  useEffect(() => {
    if (!year) return;
    fetch(`/schedules-${year}.json`)
      .then(r => r.json())
      .then(setSchedules)
      .catch(console.error);
  }, [year]);

  // 회차 전환
  const changeYear = (newYear) => {
    setStoredYear(newYear);
    setYear(newYear);
  };

  // 특정 영화의 스케줄 가져오기
  const getFilmSchedules = (filmId) => {
    return schedules.filter(schedule => schedule.film_id === filmId);
  };

  // 스케줄에 추가 후 팝업 닫기
  const handleAddToSchedule = (film, schedule) => {
    addToMySchedule(film, schedule);
    setSelectedFilm(null);
  };

  if (!films) {
    return <div className="text-center py-12 text-white">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">MY BIFF</h1>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => changeYear(e.target.value)}
              className="bg-gray-800 text-white text-sm rounded-full px-3 py-2 border border-gray-700"
            >
              {AVAILABLE_YEARS.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <Link href="/picks" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Heart className="w-6 h-6 text-red-500" />
            </Link>
            <Link href="/schedule" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Calendar className="w-6 h-6 text-blue-500" />
            </Link>
            <AuthControl />
          </div>
        </div>
      </header>
      <main className="pt-20 max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">

      {/* 헤더 정보 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">BIFF {year}</h1>
        <p className="text-gray-400">부산국제영화제 상영작 리스트</p>
        <div className="text-sm text-gray-500 mt-2">
          전체 <span className="text-white font-semibold">{films.films?.length || 0}</span>편 | 
          찜한 영화 <span className="text-red-500 font-semibold">{picks.size}</span>편 |
          일정 추가한 영화 <span className="text-blue-500 font-semibold">{mySchedule.length}</span>편
        </div>
      </div>

      {/* 영화 리스트 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {films.films?.map((film, index) => {
          const isPicked = picks.has(film.id);
          const categoryInfo = films.categories?.[film.categoryId];
          const subCategoryName = categoryInfo?.subcategories?.[film.subCategoryId];
          const filmSchedules = getFilmSchedules(film.id);
          const hasSchedules = filmSchedules.length > 0;
          
          return (
            <div key={`film-${film.id}-${index}`} className="card bg-gray-900 shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 hover:-translate-y-1">
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

                  <div className="flex gap-2">
                    {/* 찜하기 버튼 */}
                    <button
                      onClick={() => togglePick(film.id)}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        isPicked 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-500'
                      }`}
                      title={isPicked ? '찜 해제' : '찜하기'}
                    >
                      <Heart 
                        className={`w-5 h-5 ${isPicked ? 'fill-current' : ''}`} 
                      />
                    </button>

                    {/* 스케줄 버튼 */}
                    <button
                      onClick={() => setSelectedFilm(film)}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        hasSchedules
                          ? 'bg-blue-800 text-blue-300 hover:bg-blue-700 hover:text-white'
                          : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      }`}
                      title={hasSchedules ? '상영시간표 보기' : '상영시간표 없음'}
                      disabled={!hasSchedules}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 데이터 없을 때 */}
      {!films.films?.length && (
        <div className="text-center py-12 text-gray-500">
          영화 데이터를 불러올 수 없습니다.
        </div>
      )}

      {/* 상영시간표 팝업 */}
      {selectedFilm && (
        <SchedulePopup
          film={selectedFilm}
          filmSchedules={getFilmSchedules(selectedFilm.id)}
          onClose={() => setSelectedFilm(null)}
          onAddToSchedule={handleAddToSchedule}
        />
      )}
    </div>
  </main>
</div>
);
}