import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 지원 회차 목록 (최신이 기본값)
export const AVAILABLE_YEARS = ['2026', '2025'];
export const DEFAULT_YEAR = AVAILABLE_YEARS[0];
const YEAR_STORAGE_KEY = 'mybiff:year';

export function getStoredYear() {
  try {
    const saved = localStorage.getItem(YEAR_STORAGE_KEY);
    return AVAILABLE_YEARS.includes(saved) ? saved : DEFAULT_YEAR;
  } catch {
    return DEFAULT_YEAR;
  }
}

export function setStoredYear(year) {
  try {
    localStorage.setItem(YEAR_STORAGE_KEY, year);
  } catch {}
}

// 연도 구분 전 저장된 찜/스케줄 데이터를 2025년 항목으로 1회 이전
export function migrateLegacyStorage(key) {
  try {
    const legacy = localStorage.getItem(key);
    if (legacy && !localStorage.getItem(`${key}:2025`)) {
      localStorage.setItem(`${key}:2025`, legacy);
      localStorage.removeItem(key);
    }
  } catch {}
}

// 내 스케줄에 저장할 항목 형태로 변환
export function buildScheduleItem(film, schedule) {
  return {
    id: `${film.id}_${schedule.code}`,
    filmId: film.id,
    filmTitle: film.titleKo,
    filmTitleEn: film.titleEn,
    code: schedule.code,
    date: schedule.date,
    time: schedule.time,
    venue: schedule.venue,
  };
}

// 날짜/시간 순으로 정렬된 새 스케줄 목록 반환
export function sortSchedule(list) {
  const key = (item) => `${item.date.replace('-', '')}${item.time.replace(':', '')}`;
  return [...list].sort((a, b) => key(a).localeCompare(key(b)));
}

// "108min", "24, 14, 13min" 같은 runtime 문자열에서 총 분(分)을 추출
export function parseRuntimeMinutes(runtime) {
  const nums = runtime?.match(/\d+/g);
  if (!nums) return null;
  return nums.reduce((sum, n) => sum + parseInt(n, 10), 0);
}
