import { ActivityIndicator, StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { COLORS } from '../../config/constants';

interface ButtonProps {
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  style?: object;
}

export function Button({
  mode = 'contained',
  onPress,
  loading = false,
  disabled = false,
  children,
  style,
}: ButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      buttonColor={mode === 'contained' ? COLORS.primary : undefined}
      textColor={mode === 'contained' ? COLORS.white : COLORS.primary}
      style={[styles.button, style]}
      labelStyle={styles.label}
      contentStyle={styles.content}
    >
      {loading ? '' : children}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    height: 48,
  },
});
