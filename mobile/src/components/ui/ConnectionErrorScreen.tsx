import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';
import { COLORS } from '../../config/constants';

interface ConnectionErrorScreenProps {
  onRetry: () => void;
}

export function ConnectionErrorScreen({ onRetry }: ConnectionErrorScreenProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="wifi-off"
        size={56}
        color={COLORS.textSecondary}
      />
      <Text style={styles.title}>No pudimos conectar con el servidor</Text>
      <Text style={styles.text}>
        Tu sesión sigue guardada. Revisá tu conexión y volvé a intentar.
      </Text>
      <Button onPress={onRetry} style={styles.button}>
        Reintentar
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: 12,
  },
});
