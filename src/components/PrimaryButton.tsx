import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/Colors';

type PrimaryButtonProps = {
  disabled?: boolean;
  isLoading?: boolean;
  label: string;
  onPress: () => void;
};

export function PrimaryButton({ disabled = false, isLoading = false, label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      disabled={disabled || isLoading}
      hitSlop={10}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.buttonPressed : null,
        disabled || isLoading ? styles.buttonDisabled : null,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.surface} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  label: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
