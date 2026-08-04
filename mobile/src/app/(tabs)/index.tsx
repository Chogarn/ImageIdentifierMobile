import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Card } from '../../components/ui/Card';
import { COLORS } from '../../config/constants';

const options = [
  {
    label: 'Animales',
    icon: 'paw' as const,
    description: 'Identifica animales',
  },
  {
    label: 'Plantas',
    icon: 'flower' as const,
    description: 'Identifica plantas',
  },
  {
    label: 'Cámara',
    icon: 'camera' as const,
    description: 'Captura una imagen',
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <AuthGuard>
      <View style={styles.container}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Hola,{' '}
            <Text style={styles.userName}>{user?.nombre}</Text>
          </Text>
          <Text style={styles.welcomeSub}>
            ¿Qué quieres identificar hoy?
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {options.map((opt) => (
            <Card key={opt.label} style={styles.card}>
              <View style={styles.cardContent}>
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={40}
                  color={COLORS.primary}
                />
                <Text style={styles.cardLabel}>{opt.label}</Text>
                <Text style={styles.cardDescription}>{opt.description}</Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userName: {
    color: COLORS.primary,
  },
  welcomeSub: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  cardContent: {
    alignItems: 'center',
    gap: 8,
  },
  cardLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
