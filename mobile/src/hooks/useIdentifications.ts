import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { apiClient } from '../services/api';
import type { Identification } from '../types';

// historial del usuario (más nuevas primero), sin las fotos que no se pudieron reconocer:
// esas quedan guardadas en el backend (cuentan para el tope diario de Gemini) pero no se muestran.
// Se recarga cada vez que la pantalla vuelve a estar en foco, ej: al volver de identificar o de borrar una.
export function useIdentifications() {
  const [items, setItems] = useState<Identification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const data = await apiClient<Identification[]>('/identification/history');
      setItems(data.filter((item) => item.tipo !== 'desconocido'));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No pudimos cargar el historial.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [fetchItems]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const retry = () => {
    setLoading(true);
    fetchItems();
  };

  return { items, loading, refreshing, error, refresh, retry };
}

export function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// "hoy", "ayer" o la fecha corta, para las listas.
export function formatRelativeDate(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'ayer';
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}
