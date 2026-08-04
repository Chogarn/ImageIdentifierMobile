import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { Link } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { COLORS } from '../../config/constants';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const handleChange = (field: string) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError('');

    if (
      !form.nombre.trim() ||
      !form.apellido.trim() ||
      !form.nombreUsuario.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      setError('Completa todos los campos obligatorios');
      setSnackVisible(true);
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setSnackVisible(true);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSnackVisible(true);
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register({
        ...data,
        telefono: data.telefono.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
      setSnackVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>ImageIdentifier</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Registrarse</Text>

          <Input
            label="Nombre *"
            value={form.nombre}
            onChangeText={handleChange('nombre')}
            placeholder="Juan"
          />

          <Input
            label="Apellido *"
            value={form.apellido}
            onChangeText={handleChange('apellido')}
            placeholder="Pérez"
          />

          <Input
            label="Teléfono"
            value={form.telefono}
            onChangeText={handleChange('telefono')}
            placeholder="123456789"
            keyboardType="phone-pad"
          />

          <Input
            label="Nombre de usuario *"
            value={form.nombreUsuario}
            onChangeText={handleChange('nombreUsuario')}
            placeholder="juanperez"
          />

          <Input
            label="Email *"
            value={form.email}
            onChangeText={handleChange('email')}
            placeholder="tu@email.com"
            keyboardType="email-address"
          />

          <Input
            label="Contraseña *"
            value={form.password}
            onChangeText={handleChange('password')}
            placeholder="••••••••"
            secureTextEntry
          />

          <Input
            label="Repetir contraseña *"
            value={form.confirmPassword}
            onChangeText={handleChange('confirmPassword')}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          >
            Crear cuenta
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Inicia sesión</Text>
            </Link>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  form: {
    gap: 14,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});
