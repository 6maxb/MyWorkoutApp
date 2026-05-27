import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseCard } from '@/components/ExerciseCard';
import { Colors } from '@/constants/Colors';
import { useSessionDetails } from '@/hooks/useSessionDetails';
import { useSessionMutations } from '@/hooks/useSessionMutations';

const addExerciseSchema = z.object({
  name: z.string().trim().min(1, "Nom de l'exercice requis"),
});

type AddExerciseValues = z.infer<typeof addExerciseSchema>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function SessionDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const sessionId = Number(params.id);
  const inputRef = useRef<TextInput | null>(null);
  const { data: session, isLoading, reload } = useSessionDetails(sessionId);
  const { addExercise, addSetsBatch, isSaving, toggleSetCompleted } = useSessionMutations();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddExerciseValues>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(addExerciseSchema),
  });

  const submitExercise = handleSubmit(async (values) => {
    await addExercise(sessionId, values.name);
    reset();
    await reload();
  });

  async function handleAddSet(exerciseId: number, values: { weight: number; reps: number }) {
    await addSetsBatch({
      exerciseId,
      sets: [
        {
          weight: values.weight,
          reps: values.reps,
          isCompleted: false,
        },
      ],
    });
    await reload();
  }

  async function handleToggleSet(setId: number, nextValue: boolean) {
    await toggleSetCompleted(setId, nextValue);
    if (nextValue) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await reload();
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ActivityIndicator color={Colors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.content}>
          <EmptyState description="Cette séance n’existe plus dans la base locale." title="Séance introuvable" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.title}>{formatDate(session.date)}</Text>
          <Text style={styles.body}>
            {session.exercises.length} exercices · {session.totalSets} séries · {Math.round(session.totalVolume)} kg
          </Text>
          <Text style={styles.body}>
            {session.completedSets} / {session.totalSets} séries complétées
          </Text>
          {session.comment ? <Text style={styles.comment}>{session.comment}</Text> : null}
        </View>

        <View style={styles.addExerciseCard}>
          <View style={styles.addExerciseHeader}>
            <Text style={styles.cardTitle}>Ajouter un exercice</Text>
            <Pressable
              hitSlop={10}
              onPress={() => inputRef.current?.focus()}
              style={({ pressed }) => [styles.chip, pressed ? styles.pressed : null]}
            >
              <Text style={styles.chipLabel}>Focus</Text>
            </Pressable>
          </View>

          <Controller
            control={control}
            name="name"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => void submitExercise()}
                placeholder="Leg curl, développé incliné..."
                placeholderTextColor={Colors.mutedText}
                ref={inputRef}
                returnKeyType="done"
                style={styles.input}
                value={value}
              />
            )}
          />
          {errors.name ? <Text style={styles.error}>{errors.name.message}</Text> : null}

          <Pressable
            hitSlop={10}
            onPress={() => void submitExercise()}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
          >
            {isSubmitting || isSaving ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.primaryButtonLabel}>Ajouter l’exercice</Text>
            )}
          </Pressable>
        </View>

        {session.exercises.length === 0 ? (
          <EmptyState description="Ajoute un exercice à la séance." title="Aucun exercice dans cette séance" />
        ) : (
          session.exercises.map((exercise) => (
            <ExerciseCard
              exercise={exercise}
              isSaving={isSaving}
              key={exercise.id}
              onAddSet={handleAddSet}
              onToggleSet={handleToggleSet}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addExerciseCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
    ...Colors.shadow,
  },
  addExerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  body: {
    color: Colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  chip: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  comment: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 18,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  hero: {
    marginBottom: 18,
    paddingTop: 10,
  },
  input: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: Colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  loader: {
    marginTop: 32,
  },
  pressed: {
    opacity: 0.7,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 14,
  },
  primaryButtonLabel: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
});
