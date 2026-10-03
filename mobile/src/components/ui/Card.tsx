import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { COLORS } from '../../config/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

// tarjeta plana con borde fino. Si recibe onPress se oscurece un poco al tocarla.
export function Card({ children, style, onPress }: CardProps) {
  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
});
