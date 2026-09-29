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
  value?: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  last?: boolean;
}

function ProfileField({ label, value, icon, last }: ProfileFieldProps) {
  return (
    <View style={[styles.field, !last && styles.fieldDivider]}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={COLORS.primary}
        style={styles.fieldIcon}
      />
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(' ');

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
          <Text style={styles.fullName}>
            {user?.nombreUsuario || fullName}
          </Text>
          {!!fullName && !!user?.nombreUsuario && (
            <Text style={styles.username}>{fullName}</Text>
          )}
        </View>

        <Card style={styles.card}>
          <ProfileField
            icon="at"
            label="Usuario"
            value={user?.nombreUsuario}
          />
          <ProfileField
            icon="account-outline"
            label="Nombre"
            value={user?.nombre}
          />
          <ProfileField
            icon="account-details-outline"
            label="Apellido"
            value={user?.apellido}
          />
          <ProfileField
            icon="email-outline"
            label="Email"
            value={user?.email}
            last={!user?.telefono}
          />
          {!!user?.telefono && (
            <ProfileField
              icon="phone-outline"
              label="Teléfono"
              value={user.telefono}
              last
            />
          )}
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
    paddingTop: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  username: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  card: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  fieldDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fieldIcon: {
    width: 24,
  },
  fieldText: {
    flex: 1,
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
