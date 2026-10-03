import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Button } from '../../components/ui/Button';
import { IdentificationImage } from '../../components/identification/IdentificationImage';
import { useIdentifications } from '../../hooks/useIdentifications';
import { COLORS, TIPO_STYLE } from '../../config/constants';

type Filter = 'todas' | 'planta' | 'animal';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'planta', label: 'Plantas' },
  { value: 'animal', label: 'Animales' },
];

const PADDING = 20;
const GAP = 12;

const EMPTY_TEXT: Record<Filter, string> = {
  todas: 'Tocá el botón de la cámara para hacer tu primera identificación.',
  planta: 'Todavía no identificaste ninguna planta.',
  animal: 'Todavía no identificaste ningún animal.',
};

function isFilter(value: unknown): value is Filter {
  return FILTERS.some((f) => f.value === value);
}

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // ancho fijo: así la última tarjeta (si quedan impares) no se estira.
  const { width } = useWindowDimensions();
  const cardWidth = (width - PADDING * 2 - GAP) / 2;
  // el inicio puede abrir la colección ya filtrada (?tipo=planta).
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const [filter, setFilter] = useState<Filter>(isFilter(tipo) ? tipo : 'todas');
  const { items, loading, refreshing, error, refresh, retry } =
    useIdentifications();

  useEffect(() => {
    if (isFilter(tipo)) setFilter(tipo);
  }, [tipo]);

  const visible =
    filter === 'todas' ? items : items.filter((item) => item.tipo === filter);

  return (
    <AuthGuard>
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Tu colección</Text>

        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Pressable
                key={f.value}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setFilter(f.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          // la lista se dibuja siempre (también vacía) para que funcione el pull-to-refresh.
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={
              visible.length === 0 ? styles.emptyList : styles.grid
            }
            refreshing={refreshing}
            onRefresh={refresh}
            ListEmptyComponent={
              <View style={styles.center}>
                {error ? (
                  <>
                    <Text style={styles.emptyTitle}>{error}</Text>
                    <Button mode="outlined" onPress={retry}>
                      Reintentar
                    </Button>
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyTitle}>Nada por acá todavía</Text>
                    <Text style={styles.emptyText}>{EMPTY_TEXT[filter]}</Text>
                  </>
                )}
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/identification/[id]',
                    params: { id: item.id },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  { width: cardWidth },
                  pressed && styles.cardPressed,
                ]}
              >
                <IdentificationImage
                  item={item}
                  style={styles.cardImage}
                  iconSize={36}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.nombreComun}
                  </Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>
                    {item.nombreCientifico}
                  </Text>
                </View>
                <View
                  style={[
                    styles.typeDot,
                    { backgroundColor: TIPO_STYLE[item.tipo]?.strong },
                  ]}
                />
              </Pressable>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceMuted,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  grid: {
    padding: PADDING,
    paddingTop: 8,
    gap: GAP,
  },
  gridRow: {
    gap: GAP,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
  },
  cardBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  typeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
