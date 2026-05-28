import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { SessionSummary, WeeklyGoalProgress } from '@/db/types';

const WEEKLY_GOAL = 3;

function getStartOfWeek(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function buildWeeklyGoal(sessions: SessionSummary[]): WeeklyGoalProgress {
  const now = new Date();
  const weekStart = getStartOfWeek(now);
  const weekEnd = new Date(weekStart);

  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const completed = sessions.filter((session) => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  }).length;

  const remaining = Math.max(WEEKLY_GOAL - completed, 0);
  const progressPercent = Math.min(Math.round((completed / WEEKLY_GOAL) * 100), 100);
  const weekLabel = `Semaine du ${new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit',
    month: '2-digit',
  }).format(weekStart)}`;

  return {
    completed,
    goal: WEEKLY_GOAL,
    progressPercent,
    remaining,
    weekLabel,
  };
}

type SessionSummaryRow = {
  id: number;
  date: string;
  duration: number | null;
  comment: string | null;
  exerciseCount: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number | null;
};

export function useSessions() {
  const db = useSQLiteContext();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoalProgress>(buildWeeklyGoal([]));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = await db.getAllAsync<SessionSummaryRow>(`
        SELECT
          s.id,
          s.date,
          s.duration,
          s.comment,
          COUNT(DISTINCT e.id) AS exerciseCount,
          COUNT(st.id) AS totalSets,
          COALESCE(SUM(CASE WHEN st.is_completed = 1 THEN 1 ELSE 0 END), 0) AS completedSets,
          COALESCE(SUM(st.weight * st.reps), 0) AS totalVolume
        FROM sessions s
        LEFT JOIN exercises e ON e.session_id = s.id
        LEFT JOIN sets st ON st.exercise_id = e.id
        GROUP BY s.id
        ORDER BY s.date DESC, s.id DESC
      `);

      const parsedSessions = rows.map((row) => ({
        ...row,
        totalSets: row.totalSets,
        completedSets: row.completedSets,
        totalVolume: row.totalVolume ?? 0,
      }));

      setSessions(parsedSessions);
      setWeeklyGoal(buildWeeklyGoal(parsedSessions));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error('Impossible de charger les séances.'));
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  return {
    data: sessions,
    error,
    isLoading,
    reload: loadSessions,
    weeklyGoal,
  };
}
