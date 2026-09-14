import { Clock, X } from 'lucide-react';

// 상영시간표 팝업 컴포넌트
export default function SchedulePopup({ film, filmSchedules, onClose, onAddToSchedule }) {
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
