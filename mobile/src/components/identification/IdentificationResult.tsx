import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IdentificationImage } from './IdentificationImage';
import { formatDate } from '../../hooks/useIdentifications';
import { COLORS, TIPO_STYLE } from '../../config/constants';
import type { Identification } from '../../types';

const CONFIANZA_LABEL = {
  alto: 'Confianza alta',
  medio: 'Confianza media',
  bajo: 'Confianza baja',
} as const;

interface IdentificationResultProps {
  item: Identification;
  // foto recién sacada (todavía en el teléfono); si no hay, se pide al backend.
  localImageUri?: string;
  // botones de acción debajo de la ficha.
  children?: React.ReactNode;
}

// pantalla completa de una identificación: foto grande arriba y la ficha en una hoja debajo.
export function IdentificationResult({
  item,
  localImageUri,
  children,
}: IdentificationResultProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tipo = TIPO_STYLE[item.tipo] ?? TIPO_STYLE.desconocido;
  const isUnknown = item.tipo === 'desconocido';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.hero}>
        {localImageUri ? (
          <Image
            source={{ uri: localImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        ) : (
          <IdentificationImage
            item={item}
            style={StyleSheet.absoluteFill}
            iconSize={72}
          />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          style={[styles.backButton, { top: insets.top + 8 }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={COLORS.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: tipo.soft }]}>
            <MaterialCommunityIcons name={tipo.icon} size={14} color={tipo.text} />
            <Text style={[styles.pillText, { color: tipo.text }]}>
              {tipo.label}
            </Text>
          </View>
          {!isUnknown && (
            <View style={[styles.pill, styles.confidencePill]}>
              <MaterialCommunityIcons
                name="check-decagram-outline"
                size={14}
                color={COLORS.primaryDark}
              />
              <Text style={[styles.pillText, { color: COLORS.primaryDark }]}>
                {CONFIANZA_LABEL[item.nivelConfianza] ?? item.nivelConfianza}
              </Text>
            </View>
          )}
        </View>

        {isUnknown ? (
          <>
            <Text style={styles.nombre}>No pudimos reconocerla</Text>
            <Text style={styles.descripcion}>
              No encontramos una planta ni un animal en esta imagen. Probá con
              una foto más cercana y con buena luz.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.nombre}>{item.nombreComun}</Text>
            <Text style={styles.cientifico}>{item.nombreCientifico}</Text>

            <View style={styles.facts}>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Familia</Text>
                <Text style={styles.factValue}>{item.familia}</Text>
              </View>
              <View style={styles.fact}>
                <Text style={styles.factLabel}>Fecha</Text>
                <Text style={styles.factValue}>
                  {formatDate(item.createdAt) || 'Hoy'}
                </Text>
              </View>
            </View>

            <Text style={styles.descripcion}>{item.descripcion}</Text>
          </>
        )}

        {children && <View style={styles.actions}>{children}</View>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  sheet: {
    marginTop: -24,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  confidencePill: {
    backgroundColor: COLORS.primarySoft,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nombre: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cientifico: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  facts: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  fact: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  factLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  factValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  descripcion: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  actions: {
    marginTop: 24,
    gap: 8,
  },
});
