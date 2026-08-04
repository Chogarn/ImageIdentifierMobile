import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../config/constants';

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.text}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
