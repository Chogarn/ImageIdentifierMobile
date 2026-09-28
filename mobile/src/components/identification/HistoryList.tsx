import { useCallback, useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { AuthGuard } from '../auth/AuthGuard';
import { ScreenHeader } from '../ui/ScreenHeader';
import { Card } from '../ui/Card';
import { apiClient } from '../../services/api';
import { COLORS } from '../../config/constants';
import type { Identification } from '../../types';

interface HistoryListProps {
  title: string;
  tipo: 'planta' | 'animal';
  emptyHint: string;
}

export function HistoryList({ title, tipo, emptyHint }: HistoryListProps) {
  const [items, setItems] = useState<Identification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const data = await apiClient<Identification[]>(
        `/identification/history?tipo=${tipo}`,
      );
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tipo]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScreenHeader title={title} />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>
              Todavía no tenés identificaciones.
            </Text>
            <Text style={styles.emptyHint}>{emptyHint}</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.nombre}>{item.nombreComun}</Text>
                  <Text style={styles.cientifico}>
                    {item.nombreCientifico}
                  </Text>
                  <Text style={styles.descripcion}>{item.descripcion}</Text>
                  <Text style={styles.meta}>
                    Familia: {item.familia} · Confianza: {item.nivelConfianza}
                  </Text>
                </View>
              </Card>
            )}
          />
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
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  card: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 16,
  },
  nombre: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cientifico: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  descripcion: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
