'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, X, ArrowLeft, MapPin, Heart } from 'lucide-react';

const STORAGE_KEY_SCHEDULE = 'mybiff:schedule';

export default function SchedulePage() {
  const [mySchedule, setMySchedule] = useState([]);

  // 저장된 스케줄 불러오기
  useEffect(() => {
    try {
      const savedSchedule = JSON.parse(localStorage.getItem(STORAGE_KEY_SCHEDULE) || '[]');
      setMySchedule(savedSchedule);
    } catch {}
  }, []);

  // 스케줄 동기화
    const removeFromSchedule = (scheduleId) => {
    setMySchedule(prev => {
        const newSchedule = prev.filter(item => item.id !== scheduleId);
        localStorage.setItem(STORAGE_KEY_SCHEDULE, JSON.stringify(newSchedule));
        return newSchedule;
    });
    };

  // 날짜별로 그룹핑
  const groupSchedulesByDate = () => {
    const grouped = {};
    mySchedule.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });

    // 각 날짜별로 시간순 정렬
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.time.localeCompare(b.time));
    });

    return grouped;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    const month = dateString.split('-')[0];
    const day = dateString.split('-')[1];
    const date = new Date(2025, parseInt(month) - 1, parseInt(day));
    
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    
    return `${month}월 ${day}일 (${weekday})`;
  };

  // 시간 포맷팅
  const formatTime = (timeString) => {
    return timeString;
  };

  const groupedSchedules = groupSchedulesByDate();
  const sortedDates = Object.keys(groupedSchedules).sort();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
           <Link href="/" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
             <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
          </Link>
           <h1 className="text-xl font-bold text-white">내 시간표</h1>
        </div>
    
        <div className="flex gap-2">
          <Link href="/picks" className="p-2 rounded-full hover:bg-gray-800 transition-colors">
           <Heart className="w-6 h-6 text-red-500" />
          </Link>
          <div className="p-2 rounded-full bg-blue-600">
           <Calendar className="w-6 h-6 text-white" />
         </div>
        </div>
      </div>
    </header>

      <main className="pt-20 max-w-4xl mx-auto p-4">
        {mySchedule.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Calendar className="w-16 h-16 mx-auto text-gray-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-400 mb-3">아직 추가한 영화가 없어요</h3>
            <p className="text-gray-500 mb-8">영화 목록에서 + 버튼을 눌러 상영을 예약해보세요!</p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              영화 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(date => (
              <div key={date} className="space-y-4">
                {/* 날짜 헤더 */}
                <div className="border-b border-gray-800 pb-2">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {formatDate(date)}
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      ({groupedSchedules[date].length}개 상영)
                    </span>
                  </h2>
                </div>

                {/* 해당 날짜의 스케줄들 */}
                <div className="space-y-3">
                  {groupedSchedules[date].map((item) => (
                    <div key={item.id} className="bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {/* 영화 제목 */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg leading-tight">
                                  {item.filmTitle}
                                </h3>
                                {item.filmTitleEn && (
                                  <p className="text-gray-500 text-sm mt-1">{item.filmTitleEn}</p>
                                )}
                              </div>
                              <span className="text-blue-400 text-sm font-mono bg-gray-800 px-2 py-1 rounded">
                                #{item.code}
                              </span>
                            </div>

                            {/* 시간 및 장소 정보 */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
                              <div className="flex items-center gap-2 text-blue-400 font-medium">
                                <Clock className="w-4 h-4" />
                                {formatTime(item.time)}
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                {item.venue}
                              </div>
                            </div>
                          </div>

                          {/* 삭제 버튼 */}
                          <button
                            onClick={() => removeFromSchedule(item.id)}
                            className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-red-400 ml-4"
                            title="일정에서 제거"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 하단 액션 */}
            <div className="text-center pt-8 border-t border-gray-800">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              >
                더 많은 영화 찾기
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}