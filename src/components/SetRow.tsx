import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import type { WorkoutSet } from '@/db/types';

type SetRowProps = {
  index: number;
  set: WorkoutSet;
};

function SetRowComponent({ index, set }: SetRowProps) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.title}>Série {index + 1}</Text>
        <Text style={styles.meta}>
          {set.weight} kg x {set.reps} reps
        </Text>
      </View>
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
});
