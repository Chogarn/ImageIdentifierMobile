import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../config/constants';

interface ScreenHeaderProps {
  title: string;
}

// encabezado claro con flecha para volver, para las pantallas que se abren encima de las pestañas.
export function ScreenHeader({ title }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <IconButton
        icon="arrow-left"
        iconColor={COLORS.textPrimary}
        onPress={() => router.back()}
      />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingBottom: 4,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '600',
  },
});
