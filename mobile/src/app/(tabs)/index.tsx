import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { IdentificationImage } from '../../components/identification/IdentificationImage';
import {
  formatRelativeDate,
  useIdentifications,
} from '../../hooks/useIdentifications';
import { COLORS, TIPO_STYLE } from '../../config/constants';

const RECENT_COUNT = 5;
const TIPOS = ['planta', 'animal'] as const;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, loading, refreshing, error, refresh, retry } =
    useIdentifications();

  const recent = items.slice(0, RECENT_COUNT);
  const initial = (user?.nombre || user?.nombreUsuario || '?')
    .charAt(0)
    .toUpperCase();

  return (
    <AuthGuard>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>Hola, {user?.nombre}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mi perfil"
            onPress={() => router.push('/profile')}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          {TIPOS.map((tipo) => {
            const style = TIPO_STYLE[tipo];
            const count = items.filter((item) => item.tipo === tipo).length;
            return (
              <Pressable
                key={tipo}
                accessibilityRole="button"
                accessibilityLabel={`${style.plural}: ${count}`}
                onPress={() => router.push(`/collection?tipo=${tipo}`)}
                style={({ pressed }) => [
                  styles.stat,
                  { backgroundColor: style.soft },
                  pressed && styles.pressed,
                ]}
              >
                <MaterialCommunityIcons
                  name={style.icon}
                  size={20}
                  color={style.text}
                />
                <Text style={[styles.statCount, { color: style.text }]}>
                  {loading ? '–' : count}
                </Text>
                <Text
                  style={[styles.statLabel, { color: style.text }]}
                  numberOfLines={1}
                >
                  {style.plural}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recientes</Text>
          {items.length > 0 && (
            <Pressable onPress={() => router.push('/collection')} hitSlop={8}>
              <Text style={styles.sectionLink}>Ver todo</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : error ? (
          <Pressable onPress={retry} style={styles.empty}>
            <Text style={styles.emptyTitle}>{error}</Text>
            <Text style={styles.sectionLink}>Reintentar</Text>
          </Pressable>
        ) : recent.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Tu colección está vacía</Text>
            <Text style={styles.emptyText}>
              Tocá el botón de la cámara de abajo para identificar tu primera
              planta o animal.
            </Text>
            <MaterialCommunityIcons
              name="arrow-down"
              size={24}
              color={COLORS.primary}
              style={styles.emptyArrow}
            />
          </View>
        ) : (
          recent.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: '/identification/[id]',
                  params: { id: item.id },
                })
              }
              style={({ pressed }) => [
                styles.row,
                index < recent.length - 1 && styles.rowDivider,
                pressed && styles.pressed,
              ]}
            >
              <IdentificationImage
                item={item}
                style={styles.thumb}
                iconSize={24}
              />
              <View style={styles.rowText}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {item.nombreComun}
                </Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {item.nombreCientifico}
                </Text>
              </View>
              <Text style={styles.rowDate}>
                {formatRelativeDate(item.createdAt)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  pressed: {
    opacity: 0.85,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    gap: 2,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptyArrow: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rowDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
