import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Card } from '../ui/Card';
import { COLORS } from '../../config/constants';
import type { Identification } from '../../types';

interface IdentificationResultProps {
  item: Identification;
  children?: React.ReactNode;
}

export function IdentificationResult({
  item,
  children,
}: IdentificationResultProps) {
  const isUnknown = item.tipo === 'desconocido';

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.tipo}>{item.tipo}</Text>

        {isUnknown ? (
          <Text style={styles.descripcion}>
            No pudimos reconocer una planta ni un animal en esta imagen. Probá
            con una foto más cercana y con buena luz.
          </Text>
        ) : (
          <>
            <Text style={styles.nombre}>{item.nombreComun}</Text>
            <Text style={styles.cientifico}>{item.nombreCientifico}</Text>
            <Text style={styles.descripcion}>{item.descripcion}</Text>
            <Text style={styles.meta}>
              Familia: {item.familia} · Confianza: {item.nivelConfianza}
            </Text>
          </>
        )}

        {children}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  content: {
    padding: 16,
  },
  tipo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  nombre: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  cientifico: {
    fontSize: 14,
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
