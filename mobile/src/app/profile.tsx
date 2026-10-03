import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { AuthGuard } from '../components/auth/AuthGuard';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { COLORS } from '../config/constants';

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
  const initial = (user?.nombre || user?.nombreUsuario || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScreenHeader title="Mi perfil" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
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

          <Button mode="outlined" danger onPress={logout}>
            Cerrar sesión
          </Button>
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: COLORS.primaryDark,
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
    color: COLORS.textSecondary,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});
