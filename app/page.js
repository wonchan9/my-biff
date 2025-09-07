'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ExternalLink, Plus, Clock, X, Calendar } from 'lucide-react';

// 상영시간표 팝업 컴포넌트
function SchedulePopup({ film, filmSchedules, onClose, onAddToSchedule }) {
  if (!film) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">{film.titleKo}</h2>
              {film.titleEn && (
                <p className="text-gray-400 text-sm">{film.titleEn}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              상영 시간표
            </h3>
            
            {filmSchedules.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">등록된 상영 시간이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {filmSchedules.map((schedule) => (
                  <div 
                    key={schedule.code}
                    className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-white font-medium">
                            {schedule.date} {schedule.time}
                          </span>
                          <span className="text-blue-400 text-sm">
                            #{schedule.code}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{schedule.venue}</p>
                      </div>
                      <button
                        onClick={() => onAddToSchedule(film, schedule)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        일정 추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // 상태 관리
  const [films, setFilms] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [picks, setPicks] = useState(new Set());
  const [mySchedule, setMySchedule] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);

  // 영화 데이터 로드
  useEffect(() => {
    fetch('/screenings.json')
      .then(r => r.json())
      .then(setFilms)
      .catch(console.error);
  }, []);

  // 스케줄 데이터 로드
  useEffect(() => {
    fetch('/schedules.json')
      .then(r => r.json())
      .then(setSchedules)
      .catch(console.error);
  }, []);

  // localStorage에서 찜 목록 로드
  useEffect(() => {
    const loadPicks = () => {
      try {
        const saved = localStorage.getItem('mybiff:picks');
        if (saved) {
          const picksArray = JSON.parse(saved);
          setPicks(new Set(picksArray));
        }
      } catch (e) {
        console.error('찜 목록 로드 실패:', e);
      }
    };

    loadPicks();
    window.addEventListener('focus', loadPicks);
    return () => window.removeEventListener('focus', loadPicks);
  }, []);

  // localStorage에서 내 스케줄 로드
  useEffect(() => {
    const loadMySchedule = () => {
      try {
        const saved = localStorage.getItem('mybiff:schedule');
        if (saved) {
          const scheduleArray = JSON.parse(saved);
          setMySchedule(scheduleArray);
        }
      } catch (e) {
        console.error('스케줄 로드 실패:', e);
      }
    };

    loadMySchedule();
    window.addEventListener('focus', loadMySchedule);
    return () => window.removeEventListener('focus', loadMySchedule);
  }, []);

  // 특정 영화의 스케줄 가져오기
  const getFilmSchedules = (filmId) => {
    return schedules.filter(schedule => schedule.film_id === filmId);
  };

  // 찜하기/찜 해제
  const togglePick = (filmId) => {
    setPicks(prev => {
      const newPicks = new Set(prev);
      
      if (newPicks.has(filmId)) {
        newPicks.delete(filmId);
      } else {
        newPicks.add(filmId);
      }
      
      try {
        localStorage.setItem('mybiff:picks', JSON.stringify([...newPicks]));
      } catch (e) {
        console.error('찜 목록 저장 실패:', e);
      }
      
      return newPicks;
    });
  };

  // 스케줄에 추가
  const addToMySchedule = (film, schedule) => {
    const newItem = {
      id: `${film.id}_${schedule.code}`,
      filmId: film.id,
      filmTitle: film.titleKo,
      filmTitleEn: film.titleEn,
      code: schedule.code,
      date: schedule.date,
      time: schedule.time,
      venue: schedule.venue
    };

    setMySchedule(prev => {
      const exists = prev.some(item => item.id === newItem.id);
      if (exists) {
        alert('이미 추가된 상영입니다.');
        return prev;
      }

      const newSchedule = [...prev, newItem];
      newSchedule.sort((a, b) => {
        const dateTimeA = `${a.date.replace('-', '')}${a.time.replace(':', '')}`;
        const dateTimeB = `${b.date.replace('-', '')}${b.time.replace(':', '')}`;
        return dateTimeA.localeCompare(dateTimeB);
      });

      try {
        localStorage.setItem('mybiff:schedule', JSON.stringify(newSchedule));
      } catch (e) {
        console.error('스케줄 저장 실패:', e);
      }

      return newSchedule;
    });

    setSelectedFilm(null);
  };

  // 팝업 열기
  const openSchedulePopup = (film) => {
    setSelectedFilm(film);
  };

  // 팝업 닫기
  const closeSchedulePopup = () => {
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
          <div className="flex gap-2">
            <Link href="/picks" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Heart className="w-6 h-6 text-red-500" />
            </Link>
            <Link href="/schedule" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
              <Calendar className="w-6 h-6 text-blue-500" />
            </Link>
          </div>
        </div>
      </header>
      <main className="pt-20 max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">

      {/* 헤더 정보 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">BIFF 2025</h1>
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
                      onClick={() => openSchedulePopup(film)}
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
          onClose={closeSchedulePopup}
          onAddToSchedule={addToMySchedule}
        />
      )}
    </div>
  </main>
</div>
);
}