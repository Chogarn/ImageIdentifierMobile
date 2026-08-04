import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Card as PaperCard } from 'react-native-paper';
import { COLORS } from '../../config/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  return (
    <PaperCard
      style={[styles.card, style]}
      onPress={onPress}
      mode="elevated"
    >
      {children}
    </PaperCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
});
