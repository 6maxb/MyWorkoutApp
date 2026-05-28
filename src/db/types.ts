export type SessionRow = {
  id: number;
  date: string;
  duration: number | null;
  comment: string | null;
};

export type SessionSummary = SessionRow & {
  exerciseCount: number;
  totalSets: number;
  completedSets: number;
  totalVolume: number;
};

export type WeeklyGoalProgress = {
  goal: number;
  completed: number;
  remaining: number;
  progressPercent: number;
  weekLabel: string;
};

export type WorkoutSet = {
  id: number;
  exerciseId: number;
  weight: number;
  reps: number;
  isCompleted: boolean;
};

export type Exercise = {
  id: number;
  sessionId: number;
  name: string;
  orderIndex: number;
};

export type ExerciseWithSets = Exercise & {
  sets: WorkoutSet[];
  totalVolume: number;
};

export type SessionDetails = SessionRow & {
  exercises: ExerciseWithSets[];
  totalSets: number;
  completedSets: number;
  totalVolume: number;
};

export type CreateSessionInput = {
  date: string;
  duration: number | null;
  comment: string | null;
  exercises: string[];
};
