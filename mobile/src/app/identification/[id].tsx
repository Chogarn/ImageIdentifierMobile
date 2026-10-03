import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { IdentificationResult } from '../../components/identification/IdentificationResult';
import { IdentificationImage } from '../../components/identification/IdentificationImage';
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
      '¿Seguro que querés sacarla de tu historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: remove },
      ],
    );
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScreenHeader title="Detalle" />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {item && (
              <IdentificationImage
                item={item}
                style={styles.photo}
                iconSize={64}
              />
            )}
            {item && (
              <IdentificationResult item={item}>
                <Button
                  mode="outlined"
                  onPress={confirmRemove}
                  loading={deleting}
                  disabled={deleting}
                  style={styles.delete}
                >
                  Eliminar
                </Button>
              </IdentificationResult>
            )}
            {error && <Text style={styles.error}>{error}</Text>}
          </ScrollView>
        )}
      </View>
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
  },
  content: {
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  delete: {
    marginTop: 12,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
  },
});
