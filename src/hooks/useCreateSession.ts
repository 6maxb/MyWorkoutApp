import { useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import type { CreateSessionInput } from '@/db/types';

export function useCreateSession() {
  const db = useSQLiteContext();
  const [isSaving, setIsSaving] = useState(false);

  const createSession = async (input: CreateSessionInput) => {
    setIsSaving(true);

    let sessionId = 0;

    try {
      await db.withExclusiveTransactionAsync(async (txn) => {
        const sessionResult = await txn.runAsync(
          'INSERT INTO sessions (date, duration, comment) VALUES (?, ?, ?)',
          input.date,
          input.duration,
          input.comment
        );

        sessionId = sessionResult.lastInsertRowId;

        const uniqueExercises = input.exercises
          .map((exercise) => exercise.trim())
          .filter((exercise, index, array) => exercise.length > 0 && array.indexOf(exercise) === index);

        for (const [index, exerciseName] of uniqueExercises.entries()) {
          await txn.runAsync(
            'INSERT INTO exercises (session_id, name, order_index) VALUES (?, ?, ?)',
            sessionId,
            exerciseName,
            index
          );
        }
      });

      return sessionId;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    createSession,
    isSaving,
  };
}
