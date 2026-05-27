import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { Colors } from '@/constants/Colors';
import type { ExerciseWithSets } from '@/db/types';
import { SetRow } from '@/components/SetRow';

const addSetSchema = z.object({
  weight: z
    .string()
    .trim()
    .min(1, 'Charge requise')
    .refine((value) => Number(value) >= 0, 'Charge invalide'),
  reps: z
    .string()
    .trim()
    .min(1, 'Nombre de répétitions requis')
    .refine((value) => Number(value) >= 1, 'Minimum 1 répétition'),
});

type AddSetValues = z.infer<typeof addSetSchema>;

type ExerciseCardProps = {
  exercise: ExerciseWithSets;
  isSaving: boolean;
  onAddSet: (exerciseId: number, values: { weight: number; reps: number }) => Promise<void>;
  onToggleSet: (setId: number, nextValue: boolean) => Promise<void>;
};

function ExerciseCardComponent({ exercise, isSaving, onAddSet, onToggleSet }: ExerciseCardProps) {
  const repsRef = useRef<TextInput | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddSetValues>({
    defaultValues: {
      weight: '',
      reps: '',
    },
    resolver: zodResolver(addSetSchema),
  });

  const submit = handleSubmit(async (values) => {
    await onAddSet(exercise.id, {
      weight: Number(values.weight),
      reps: Number(values.reps),
    });
    reset();
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{exercise.name}</Text>
          <Text style={styles.subtitle}>{Math.round(exercise.totalVolume)} kg de volume</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{exercise.sets.length} séries</Text>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Charge</Text>
          <Controller
            control={control}
            name="weight"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => repsRef.current?.focus()}
                placeholder="60"
                placeholderTextColor={Colors.mutedText}
                returnKeyType="next"
                style={styles.input}
                value={value}
              />
            )}
          />
          {errors.weight ? <Text style={styles.error}>{errors.weight.message}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Reps</Text>
          <Controller
            control={control}
            name="reps"
            render={({ field: { onBlur, onChange, value } }) => (
              <TextInput
                keyboardType="numeric"
                onBlur={onBlur}
                onChangeText={onChange}
                onSubmitEditing={() => void submit()}
                placeholder="8"
                placeholderTextColor={Colors.mutedText}
                ref={repsRef}
                returnKeyType="done"
                style={styles.input}
                value={value}
              />
            )}
          />
          {errors.reps ? <Text style={styles.error}>{errors.reps.message}</Text> : null}
        </View>
      </View>

      <Pressable
        hitSlop={10}
        onPress={() => void submit()}
        style={({ pressed }) => [styles.addButton, pressed ? styles.addButtonPressed : null]}
      >
        {isSubmitting || isSaving ? (
          <ActivityIndicator color={Colors.surface} />
        ) : (
          <Text style={styles.addButtonLabel}>Ajouter une série</Text>
        )}
      </Pressable>

      <View style={styles.setsContainer}>
        {exercise.sets.map((set, index) => (
          <SetRow
            index={index}
            key={set.id}
            onToggle={() => void onToggleSet(set.id, !set.isCompleted)}
            set={set}
          />
        ))}
      </View>
    </View>
  );
}

export function ExerciseCard(props: ExerciseCardProps) {
  return <ExerciseCardComponent {...props} />;
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 4,
  },
  addButtonLabel: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  badge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
    ...Colors.shadow,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  formRow: {
    columnGap: 12,
    flexDirection: 'row',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: Colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputLabel: {
    color: Colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flex: 1,
  },
  setsContainer: {
    marginTop: 8,
  },
  subtitle: {
    color: Colors.mutedText,
    fontSize: 14,
    marginTop: 4,
  },
  title: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});
