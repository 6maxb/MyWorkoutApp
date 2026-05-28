import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SessionListItem } from '@/components/SessionListItem';
import { Colors } from '@/constants/Colors';
import { useCreateSession } from '@/hooks/useCreateSession';
import { useSessions } from '@/hooks/useSessions';

const createSessionSchema = z.object({
  duration: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || Number(value) >= 1, 'La durée doit être supérieure à 0'),
  comment: z.string().trim().optional(),
  exercises: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Nom de l'exercice requis"),
      })
    )
    .min(1, 'Ajoute au moins un exercice'),
});

type CreateSessionValues = z.infer<typeof createSessionSchema>;

const defaultExerciseValues = [{ name: 'Développé couché' }, { name: 'Rowing barre' }];

export default function TodayScreen() {
  const router = useRouter();
  const durationRef = useRef<TextInput | null>(null);
  const commentRef = useRef<TextInput | null>(null);
  const exerciseRefs = useRef<Array<TextInput | null>>([]);
  const { createSession, isSaving } = useCreateSession();
  const { data: sessions, error, isLoading, reload } = useSessions();
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSessionValues>({
    defaultValues: {
      duration: '',
      comment: '',
      exercises: defaultExerciseValues,
    },
    resolver: zodResolver(createSessionSchema),
  });
  const { append, fields, remove } = useFieldArray({
    control,
    name: 'exercises',
  });

  const latestSession = sessions[0] ?? null;
  let latestSummary = 'Aucune séance encore enregistrée.';

  if (latestSession) {
    latestSummary = `${latestSession.exerciseCount} exercices · ${latestSession.completedSets}/${latestSession.totalSets} séries · ${Math.round(latestSession.totalVolume)} kg`;
  }

  const submit = handleSubmit(async (values) => {
    const sessionId = await createSession({
      date: new Date().toISOString(),
      duration: values.duration ? Number(values.duration) : null,
      comment: values.comment?.trim() ? values.comment.trim() : null,
      exercises: values.exercises.map((exercise) => exercise.name),
    });

    reset({
      duration: '',
      comment: '',
      exercises: defaultExerciseValues,
    });
    await reload();
    router.push(`/session/${sessionId}`);
  });

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <FlatList
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            ) : (
              <EmptyState
                description="Crée ta première séance puis ajoute les séries au fur et à mesure."
                title="Aucune séance enregistrée"
              />
            )
          }
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <View style={styles.panel}>
                <Text style={styles.sectionTitle}>Nouvelle séance</Text>
                <Text style={styles.sectionBody}>Dernière séance : {latestSummary}</Text>
                {error ? <Text style={styles.errorBox}>Impossible de charger les séances locales.</Text> : null}

                <View style={styles.formStack}>
                  <View>
                    <Text style={styles.label}>Durée estimée (min)</Text>
                    <Controller
                      control={control}
                      name="duration"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          keyboardType="numeric"
                          onBlur={onBlur}
                          onChangeText={onChange}
                          onSubmitEditing={() => commentRef.current?.focus()}
                          placeholder="45"
                          placeholderTextColor={Colors.mutedText}
                          ref={durationRef}
                          returnKeyType="next"
                          style={styles.input}
                          value={value}
                        />
                      )}
                    />
                    {errors.duration ? <Text style={styles.error}>{errors.duration.message}</Text> : null}
                  </View>

                  <View>
                    <Text style={styles.label}>Commentaire</Text>
                    <Controller
                      control={control}
                      name="comment"
                      render={({ field: { onBlur, onChange, value } }) => (
                        <TextInput
                          onBlur={onBlur}
                          onChangeText={onChange}
                          onSubmitEditing={() => exerciseRefs.current[0]?.focus()}
                          placeholder="Focus pecs / tirages"
                          placeholderTextColor={Colors.mutedText}
                          ref={commentRef}
                          returnKeyType="next"
                          style={styles.input}
                          value={value}
                        />
                      )}
                    />
                  </View>

                  <View>
                    <View style={styles.exerciseHeader}>
                        <Text style={styles.label}>Exercices</Text>
                        <Pressable
                          hitSlop={10}
                          onPress={() => append({ name: '' })}
                          style={({ pressed }) => [styles.secondaryAction, pressed ? styles.pressed : null]}
                        >
                        <Text style={styles.secondaryActionLabel}>Ajouter</Text>
                      </Pressable>
                    </View>

                    {fields.map((field, index) => (
                      <View key={field.id} style={styles.exerciseFieldRow}>
                        <View style={styles.exerciseInputWrap}>
                          <Controller
                            control={control}
                            name={`exercises.${index}.name`}
                            render={({ field: currentField }) => (
                              <TextInput
                                onBlur={currentField.onBlur}
                                onChangeText={currentField.onChange}
                                onSubmitEditing={() => {
                                  const nextRef = exerciseRefs.current[index + 1];
                                  if (nextRef) {
                                    nextRef.focus();
                                    return;
                                  }
                                  void submit();
                                }}
                                placeholder="Squat, tractions..."
                                placeholderTextColor={Colors.mutedText}
                                ref={(ref) => {
                                  exerciseRefs.current[index] = ref;
                                }}
                                returnKeyType={index === fields.length - 1 ? 'done' : 'next'}
                                style={styles.input}
                                value={currentField.value}
                              />
                            )}
                          />
                          {errors.exercises?.[index]?.name ? (
                            <Text style={styles.error}>{errors.exercises[index]?.name?.message}</Text>
                          ) : null}
                        </View>

                        {fields.length > 1 ? (
                          <Pressable
                            hitSlop={10}
                            onPress={() => remove(index)}
                            style={({ pressed }) => [styles.removeButton, pressed ? styles.pressed : null]}
                          >
                            <Text style={styles.removeButtonLabel}>Retirer</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>

                <PrimaryButton isLoading={isSaving} label="Démarrer la séance" onPress={() => void submit()} />
              </View>

              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>Historique récent</Text>
              </View>
            </View>
          }
          contentContainerStyle={styles.listContent}
          data={sessions}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={() => void reload()}
          renderItem={({ item }) => <SessionListItem session={item} />}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: '#fde7e5',
    borderColor: '#f5c2bd',
    borderRadius: 12,
    borderWidth: 1,
    color: Colors.danger,
    fontSize: 13,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  exerciseFieldRow: {
    alignItems: 'flex-start',
    columnGap: 10,
    flexDirection: 'row',
    marginBottom: 12,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseInputWrap: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  formStack: {
    rowGap: 16,
  },
  headerContent: {
    paddingBottom: 8,
  },
  historyHeader: {
    marginTop: 28,
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
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 18,
  },
  loader: {
    marginTop: 32,
  },
  panel: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    ...Colors.shadow,
  },
  pressed: {
    opacity: 0.7,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: '#fde7e5',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  removeButtonLabel: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  secondaryAction: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryActionLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBody: {
    color: Colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
});
