import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { COLORS } from '../../config/constants';

interface ProfileFieldProps {
  label: string;
  value: string;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <AuthGuard>
      <View style={styles.container}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={64}
              color={COLORS.primary}
            />
          </View>
          <Text style={styles.username}>{user?.nombreUsuario}</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.fieldsContainer}>
            <ProfileField label="Nombre" value={user?.nombre || ''} />
            <ProfileField label="Apellido" value={user?.apellido || ''} />
            <ProfileField label="Email" value={user?.email || ''} />
            {user?.telefono && (
              <ProfileField label="Teléfono" value={user.telefono} />
            )}
          </View>
        </Card>

        <Button
          mode="outlined"
          onPress={logout}
          style={styles.logoutButton}
        >
          Cerrar sesión
        </Button>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  card: {
    marginBottom: 24,
  },
  fieldsContainer: {
    gap: 16,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
});
