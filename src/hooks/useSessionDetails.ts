import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { ExerciseWithSets, SessionDetails, SessionRow, WorkoutSet } from '@/db/types';

type ExerciseRow = {
  id: number;
  session_id: number;
  name: string;
  order_index: number;
};

type SetRow = {
  id: number;
  exercise_id: number;
  weight: number;
  reps: number;
  is_completed: number;
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

      const sets = await db.getAllAsync<SetRow>(
        `
          SELECT st.id, st.exercise_id, st.weight, st.reps, st.is_completed
          FROM sets st
          INNER JOIN exercises e ON e.id = st.exercise_id
          WHERE e.session_id = ?
          ORDER BY st.id ASC
        `,
        sessionId
      );

      const setsByExercise = new Map<number, WorkoutSet[]>();

      for (const currentSet of sets) {
        const exerciseSets = setsByExercise.get(currentSet.exercise_id) ?? [];
        exerciseSets.push({
          id: currentSet.id,
          exerciseId: currentSet.exercise_id,
          weight: currentSet.weight,
          reps: currentSet.reps,
          isCompleted: currentSet.is_completed === 1,
        });
        setsByExercise.set(currentSet.exercise_id, exerciseSets);
      }

      const parsedExercises: ExerciseWithSets[] = exercises.map((exercise) => {
        const exerciseSets = setsByExercise.get(exercise.id) ?? [];

        return {
          id: exercise.id,
          sessionId: exercise.session_id,
          name: exercise.name,
          orderIndex: exercise.order_index,
          sets: exerciseSets,
          totalVolume: exerciseSets.reduce((total, currentSet) => total + currentSet.weight * currentSet.reps, 0),
        };
      });

      const totalSets = parsedExercises.reduce((total, exercise) => total + exercise.sets.length, 0);
      const totalVolume = parsedExercises.reduce((total, exercise) => total + exercise.totalVolume, 0);

      setSession({
        ...session,
        exercises: parsedExercises,
        totalSets,
        completedSets: 0,
        totalVolume,
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
