import type { PropsWithChildren } from 'react';
import { SQLiteProvider } from 'expo-sqlite';

import { runMigrations } from '@/db/migrations';

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      databaseName="my-workout-app.db"
      onInit={runMigrations}
      options={{ enableChangeListener: true }}
    >
      {children}
    </SQLiteProvider>
  );
}
