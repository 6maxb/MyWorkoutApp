import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import type { SessionSummary } from '@/db/types';

type SessionListItemProps = {
  session: SessionSummary;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-BE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function SessionListItemComponent({ session }: SessionListItemProps) {
  const router = useRouter();
  let secondaryLine = `${session.exerciseCount} exercices · ${session.totalSets} séries`;

  if (session.totalSets > 0) {
    secondaryLine = `${session.exerciseCount} exercices · ${session.completedSets}/${session.totalSets} séries`;
  }

  return (
    <Pressable
      hitSlop={10}
      onPress={() => router.push(`/session/${session.id}`)}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>{formatDate(session.date)}</Text>
          <Text style={styles.meta}>{secondaryLine}</Text>
          {session.duration ? <Text style={styles.meta}>{session.duration} min</Text> : null}
          {session.comment ? <Text style={styles.comment}>{session.comment}</Text> : null}
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeValue}>{Math.round(session.totalVolume)} kg</Text>
        </View>
      </View>
    </Pressable>
  );
}

export const SessionListItem = memo(SessionListItemComponent);

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 84,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    ...Colors.shadow,
  },
  comment: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  meta: {
    color: Colors.mutedText,
    fontSize: 14,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
});
