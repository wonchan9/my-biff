import { Clock, MapPin, X, ExternalLink } from 'lucide-react';

const PX_PER_MIN = 1.1; // 시간 간격을 픽셀로 환산하는 배율
const MIN_GAP_PX = 28; // 시간이 붙어있어도 최소한으로 벌려줄 간격
const MAX_GAP_PX = 140; // 공백이 길어도 화면을 너무 많이 차지하지 않도록 제한

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatGap(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

function GapConnector({ minutes }) {
  const gapPx = Math.min(MAX_GAP_PX, Math.max(MIN_GAP_PX, minutes * PX_PER_MIN));
  return (
    <div className="flex flex-col items-center ml-3" style={{ height: gapPx }}>
      <div className="w-px flex-1 border-l-2 border-dashed border-gray-700" />
      {minutes >= 30 && (
        <span className="text-xs text-gray-500 px-2 whitespace-nowrap">쉬는시간 {formatGap(minutes)}</span>
      )}
      <div className="w-px flex-1 border-l-2 border-dashed border-gray-700" />
    </div>
  );
}

// 겹치는 시간대(같은 시각 또는 시간이 역전됨)를 감지 — 실수로 이중 예매한 경우 표시
function isOverlapping(prev, curr) {
  return timeToMinutes(curr.time) <= timeToMinutes(prev.time);
}

export default function ScheduleTimetable({ sortedDates, groupedSchedules, formatDate, getFilmDetailUrl, onRemove }) {
  return (
    <div className="space-y-8">
      {sortedDates.map(date => {
        const items = groupedSchedules[date];
        return (
          <div key={date} className="space-y-0">
            <div className="border-b border-gray-800 pb-2 mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                {formatDate(date)}
              </h2>
            </div>

            {items.map((item, i) => {
              const detailUrl = getFilmDetailUrl(item.filmId);
              const prev = items[i - 1];
              const overlap = prev && isOverlapping(prev, item);
              return (
                <div key={item.id}>
                  {i > 0 && !overlap && (
                    <GapConnector minutes={timeToMinutes(item.time) - timeToMinutes(prev.time)} />
                  )}
                  {i > 0 && overlap && (
                    <div className="ml-3 py-1">
                      <span className="text-xs text-red-400">⚠ 이전 상영과 시간이 겹쳐요</span>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                    </div>
                    <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 p-3 mb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.time}
                            <span className="text-gray-600 font-mono text-xs">#{item.code}</span>
                          </div>
                          <h3 className="text-white font-medium leading-tight truncate">{item.filmTitle}</h3>
                          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.venue}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {detailUrl && (
                            <a
                              href={detailUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                              title="자세히 보기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => onRemove(item.id)}
                            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                            title="일정에서 제거"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
