import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

type AddSetInput = {
  exerciseId: number;
  sets: Array<{
    weight: number;
    reps: number;
    isCompleted?: boolean;
  }>;
};

export function useSessionMutations() {
  const db = useSQLiteContext();
  const [isSaving, setIsSaving] = useState(false);

  const addExercise = async (sessionId: number, name: string) => {
    setIsSaving(true);

    try {
      const orderRow = await db.getFirstAsync<{ nextOrder: number }>(
        'SELECT COALESCE(MAX(order_index) + 1, 0) AS nextOrder FROM exercises WHERE session_id = ?',
        sessionId
      );

      await db.runAsync(
        'INSERT INTO exercises (session_id, name, order_index) VALUES (?, ?, ?)',
        sessionId,
        name.trim(),
        orderRow?.nextOrder ?? 0
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addSetsBatch = async ({ exerciseId, sets }: AddSetInput) => {
    setIsSaving(true);

    try {
      await db.withExclusiveTransactionAsync(async (txn) => {
        const statement = await txn.prepareAsync(
          'INSERT INTO sets (exercise_id, weight, reps, is_completed) VALUES (?, ?, ?, ?)'
        );

        try {
          for (const currentSet of sets) {
            await statement.executeAsync(
              exerciseId,
              currentSet.weight,
              currentSet.reps,
              currentSet.isCompleted ? 1 : 0
            );
          }
        } finally {
          await statement.finalizeAsync();
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetCompleted = async (setId: number, nextValue: boolean) => {
    await db.runAsync('UPDATE sets SET is_completed = ? WHERE id = ?', nextValue ? 1 : 0, setId);
  };

  return {
    addExercise,
    addSetsBatch,
    isSaving,
    toggleSetCompleted,
  };
}
