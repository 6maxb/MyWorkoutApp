import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import type { WorkoutSet } from '@/db/types';

type SetRowProps = {
  index: number;
  onToggle: () => void;
  set: WorkoutSet;
};

function SetRowComponent({ index, onToggle, set }: SetRowProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>Série {index + 1}</Text>
        <Text style={styles.meta}>
          {set.weight} kg x {set.reps} reps
        </Text>
      </View>

      <Pressable
        hitSlop={10}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.toggle,
          set.isCompleted ? styles.toggleCompleted : null,
          pressed ? styles.togglePressed : null,
        ]}
      >
        <Text style={[styles.toggleLabel, set.isCompleted ? styles.toggleLabelCompleted : null]}>
          {set.isCompleted ? 'Complétée' : 'À faire'}
        </Text>
      </Pressable>
    </View>
  );
}

export function SetRow(props: SetRowProps) {
  return <SetRowComponent {...props} />;
}

const styles = StyleSheet.create({
  meta: {
    color: Colors.mutedText,
    fontSize: 14,
    marginTop: 2,
  },
  row: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  toggle: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  toggleCompleted: {
    backgroundColor: '#d8ead8',
  },
  toggleLabel: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  toggleLabelCompleted: {
    color: Colors.success,
  },
  togglePressed: {
    opacity: 0.7,
  },
});
