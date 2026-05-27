import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { ExerciseWithSets, SessionDetails, SessionRow } from '@/db/types';

type ExerciseRow = {
  id: number;
  session_id: number;
  name: string;
  order_index: number;
};

export function useSessionDetails(sessionId: number) {
  const db = useSQLiteContext();
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await db.getFirstAsync<SessionRow>(
        'SELECT id, date, duration, comment FROM sessions WHERE id = ?',
        sessionId
      );

      if (!session) {
        setSession(null);
        return;
      }

      const exercises = await db.getAllAsync<ExerciseRow>(
        `
          SELECT id, session_id, name, order_index
          FROM exercises
          WHERE session_id = ?
          ORDER BY order_index ASC, id ASC
        `,
        sessionId
      );

      const parsedExercises: ExerciseWithSets[] = exercises.map((exercise) => {
        return {
          id: exercise.id,
          sessionId: exercise.session_id,
          name: exercise.name,
          orderIndex: exercise.order_index,
          sets: [],
          totalVolume: 0,
        };
      });

      setSession({
        ...session,
        exercises: parsedExercises,
        totalSets: 0,
        completedSets: 0,
        totalVolume: 0,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error('Impossible de charger la séance.'));
    } finally {
      setIsLoading(false);
    }
  }, [db, sessionId]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return {
    data: session,
    error,
    isLoading,
    reload: loadSession,
  };
}
