import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { SessionSummary } from '@/db/types';

type SessionSummaryRow = {
  id: number;
  date: string;
  duration: number | null;
  comment: string | null;
  exerciseCount: number;
};

export function useSessions() {
  const db = useSQLiteContext();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
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
          COUNT(e.id) AS exerciseCount
        FROM sessions s
        LEFT JOIN exercises e ON e.session_id = s.id
        GROUP BY s.id
        ORDER BY s.date DESC, s.id DESC
      `);

      const parsedSessions = rows.map((row) => ({
        ...row,
        totalSets: 0,
        completedSets: 0,
        totalVolume: 0,
      }));

      setSessions(parsedSessions);
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
  };
}
