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
