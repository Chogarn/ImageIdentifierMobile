import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { COLORS } from '../../config/constants';

interface ButtonProps {
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: string;
  style?: object;
  // rojo, para acciones destructivas (ej: eliminar).
  danger?: boolean;
}

export function Button({
  mode = 'contained',
  onPress,
  loading = false,
  disabled = false,
  children,
  style,
  danger = false,
}: ButtonProps) {
  const color = danger ? COLORS.error : COLORS.primary;

  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      buttonColor={mode === 'contained' ? color : undefined}
      textColor={mode === 'contained' ? COLORS.white : color}
      style={[
        styles.button,
        mode === 'outlined' && { borderColor: danger ? COLORS.error : COLORS.border },
        style,
      ]}
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
