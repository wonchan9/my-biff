const PX_PER_MIN = 1; // 1분당 세로 픽셀 (시간당 60px)
const AXIS_W = 44; // 왼쪽 시간축 폭
const COL_W = 112; // 날짜 한 칸의 폭
const HEADER_H = 40; // 날짜 헤더 높이
const MIN_BLOCK_H = 32; // 상영시간을 몰라도 최소한으로 보여줄 블록 높이
// ponytail: 실제 러닝타임을 못 찾으면 상영시간을 이 값(분)으로 가정
const DEFAULT_RUNTIME_MIN = 100;

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export default function ScheduleGrid({ sortedDates, groupedSchedules, formatDateShort, getFilmDetailUrl, getFilmRuntimeMinutes }) {
  const allItems = sortedDates.flatMap(d => groupedSchedules[d]);
  const starts = allItems.map(item => timeToMinutes(item.time));
  const ends = allItems.map(item => timeToMinutes(item.time) + (getFilmRuntimeMinutes(item.filmId) || DEFAULT_RUNTIME_MIN));

  // 그리드 시간 범위: 실제 일정 앞뒤로 1시간 여유, 06:00~다음날 03:00 사이로 제한
  const startMinutes = Math.max(6 * 60, Math.floor(Math.min(...starts) / 60) * 60 - 60);
  const endMinutes = Math.min(27 * 60, Math.ceil(Math.max(...ends) / 60) * 60 + 60);
  const hours = [];
  for (let m = startMinutes; m <= endMinutes; m += 60) hours.push(m);
  const gridHeight = (endMinutes - startMinutes) * PX_PER_MIN;

  const formatHour = (m) => `${String(Math.floor((m / 60) % 24)).padStart(2, '0')}:00`;

  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="inline-flex" style={{ minWidth: '100%' }}>
        {/* 시간축 */}
        <div className="sticky left-0 z-10 bg-black shrink-0" style={{ width: AXIS_W }}>
          <div style={{ height: HEADER_H }} />
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((m) => (
              <div
                key={m}
                className="absolute left-0 right-1 text-right text-[10px] text-gray-500"
                style={{ top: (m - startMinutes) * PX_PER_MIN - 6 }}
              >
                {formatHour(m)}
              </div>
            ))}
          </div>
        </div>

        {/* 날짜별 컬럼 */}
        {sortedDates.map((date) => (
          <div key={date} className="relative border-l border-gray-800 shrink-0" style={{ width: COL_W }}>
            <div
              className="sticky top-20 z-10 bg-gray-900 border-b border-gray-800 flex items-center justify-center text-xs font-semibold text-white"
              style={{ height: HEADER_H }}
            >
              {formatDateShort(date)}
            </div>
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 border-t border-gray-800"
                  style={{ top: (m - startMinutes) * PX_PER_MIN }}
                />
              ))}
              {groupedSchedules[date].map((item) => {
                const start = timeToMinutes(item.time);
                const runtime = getFilmRuntimeMinutes(item.filmId) || DEFAULT_RUNTIME_MIN;
                const top = (start - startMinutes) * PX_PER_MIN;
                const height = Math.max(MIN_BLOCK_H, runtime * PX_PER_MIN);
                const detailUrl = getFilmDetailUrl(item.filmId);
                const Block = detailUrl ? 'a' : 'div';
                return (
                  <Block
                    key={item.id}
                    {...(detailUrl ? { href: detailUrl, target: '_blank', rel: 'noreferrer' } : {})}
                    className="absolute left-0.5 right-0.5 rounded bg-blue-950 border border-blue-700 px-1 py-0.5 overflow-hidden hover:border-blue-400 transition-colors block"
                    style={{ top, height }}
                    title={`${item.time} ${item.filmTitle} (${item.venue})`}
                  >
                    <div className="text-[10px] font-semibold text-blue-300 leading-tight">{item.time}</div>
                    <div className="text-[11px] text-white leading-tight truncate">{item.filmTitle}</div>
                    <div className="text-[9px] text-gray-400 leading-tight truncate">{item.venue}</div>
                  </Block>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
