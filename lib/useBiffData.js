'use client';
import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { buildScheduleItem, sortSchedule, migrateLegacyStorage } from './utils';

const PICKS_KEY = 'mybiff:picks';
const SCHEDULE_KEY = 'mybiff:schedule';

function readLocal(key, year) {
  try {
    return JSON.parse(localStorage.getItem(`${key}:${year}`) || '[]');
  } catch {
    return [];
  }
}

function writeLocal(key, year, value) {
  try {
    localStorage.setItem(`${key}:${year}`, JSON.stringify(value));
  } catch {}
}

// 찜/내 스케줄을 로그인 시 서버(Neon)에, 비로그인 시 localStorage에 저장.
// 로그인 직후 로컬에만 있던 데이터는 서버로 1회 이전.
export function useBiffData(year) {
  const { isSignedIn, isLoaded } = useUser();
  const [state, setState] = useState({ picks: new Set(), schedule: [] });
  const [ready, setReady] = useState(false);

  const persist = useCallback((next) => {
    if (isSignedIn) {
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, picks: [...next.picks], schedule: next.schedule }),
      }).catch(console.error);
    } else {
      writeLocal(PICKS_KEY, year, [...next.picks]);
      writeLocal(SCHEDULE_KEY, year, next.schedule);
    }
  }, [isSignedIn, year]);

  useEffect(() => {
    if (!year || !isLoaded) return;
    migrateLegacyStorage(PICKS_KEY);
    migrateLegacyStorage(SCHEDULE_KEY);
    setReady(false);

    (async () => {
      const localPicks = readLocal(PICKS_KEY, year);
      const localSchedule = readLocal(SCHEDULE_KEY, year);

      if (!isSignedIn) {
        setState({ picks: new Set(localPicks), schedule: localSchedule });
        setReady(true);
        return;
      }

      try {
        const res = await fetch(`/api/state?year=${year}`);
        const server = res.ok ? await res.json() : { picks: [], schedule: [] };
        const hasLocal = localPicks.length > 0 || localSchedule.length > 0;
        const serverEmpty = server.picks.length === 0 && server.schedule.length === 0;

        if (hasLocal && serverEmpty) {
          // 로그인 첫 이용: 기존 로컬 데이터를 서버로 이전
          const next = { picks: new Set(localPicks), schedule: localSchedule };
          setState(next);
          persist(next);
        } else {
          setState({ picks: new Set(server.picks), schedule: server.schedule });
        }
      } catch (e) {
        console.error('서버 데이터 로드 실패:', e);
        setState({ picks: new Set(localPicks), schedule: localSchedule });
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, isSignedIn, isLoaded]);

  const togglePick = useCallback((filmId) => {
    const nextPicks = new Set(state.picks);
    nextPicks.has(filmId) ? nextPicks.delete(filmId) : nextPicks.add(filmId);
    const next = { picks: nextPicks, schedule: state.schedule };
    setState(next);
    persist(next);
  }, [state, persist]);

  const addToMySchedule = useCallback((film, schedule) => {
    const newItem = buildScheduleItem(film, schedule);
    if (state.schedule.some(item => item.id === newItem.id)) {
      alert('이미 추가된 상영입니다.');
      return;
    }
    const next = { picks: state.picks, schedule: sortSchedule([...state.schedule, newItem]) };
    setState(next);
    persist(next);
  }, [state, persist]);

  const removeFromSchedule = useCallback((scheduleId) => {
    const next = { picks: state.picks, schedule: state.schedule.filter(item => item.id !== scheduleId) };
    setState(next);
    persist(next);
  }, [state, persist]);

  return {
    picks: state.picks,
    mySchedule: state.schedule,
    ready,
    isSignedIn,
    togglePick,
    addToMySchedule,
    removeFromSchedule,
  };
}
