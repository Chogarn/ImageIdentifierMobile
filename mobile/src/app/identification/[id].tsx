import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IdentificationResult } from '../../components/identification/IdentificationResult';
import { apiClient } from '../../services/api';
import { COLORS } from '../../config/constants';
import type { Identification } from '../../types';

export default function IdentificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Identification | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient<Identification>(`/identification/${id}`)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'No pudimos cargar el detalle.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const remove = async () => {
    setDeleting(true);
    setError(null);
    try {
      await apiClient(`/identification/${id}`, { method: 'DELETE' });
      router.back();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos eliminarla.',
      );
      setDeleting(false);
    }
  };

  const confirmRemove = () => {
    Alert.alert(
      'Eliminar identificación',
      '¿Seguro que querés sacarla de tu colección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: remove },
      ],
    );
  };

  // mientras carga (o si falló la carga) no hay foto que mostrar: encabezado simple.
  if (loading || !item) {
    return (
      <AuthGuard>
        <View style={styles.container}>
          <ScreenHeader title="Detalle" />
          <View style={styles.center}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <Text style={styles.error}>{error}</Text>
            )}
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <IdentificationResult item={item}>
        <Button
          mode="text"
          danger
          onPress={confirmRemove}
          loading={deleting}
          disabled={deleting}
        >
          Eliminar de mi colección
        </Button>
        {error && <Text style={styles.error}>{error}</Text>}
      </IdentificationResult>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
  },
});
