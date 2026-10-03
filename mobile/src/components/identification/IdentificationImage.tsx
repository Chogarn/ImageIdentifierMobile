import { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getToken } from '../../services/api';
import { API_URL } from '../../config/constants';
import type { Identification } from '../../types';

// color e ícono por tipo, para cuando no hay foto (identificaciones viejas o error al cargarla).
const PLACEHOLDER = {
  planta: { icon: 'sprout', background: '#C0DD97', color: '#27500A' },
  animal: { icon: 'paw', background: '#FAC775', color: '#633806' },
  desconocido: { icon: 'help', background: '#D3D1C7', color: '#444441' },
} as const;

interface IdentificationImageProps {
  item: Pick<Identification, 'id' | 'tipo' | 'imageFile'>;
  style?: ViewStyle;
  iconSize?: number;
}

// muestra la foto guardada de una identificación. La pide al backend con el token,
// porque las fotos son privadas de cada usuario.
export function IdentificationImage({
  item,
  style,
  iconSize = 32,
}: IdentificationImageProps) {
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (item.imageFile) {
      getToken().then(setToken);
    }
  }, [item.imageFile]);

  const placeholder = PLACEHOLDER[item.tipo] ?? PLACEHOLDER.desconocido;

  if (!item.imageFile || failed) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: placeholder.background },
          style,
        ]}
      >
        <MaterialCommunityIcons
          name={placeholder.icon}
          size={iconSize}
          color={placeholder.color}
        />
      </View>
    );
  }

  // el tamaño/bordes se aplican al contenedor y la foto lo llena.
  return (
    <View
      style={[
        styles.frame,
        { backgroundColor: placeholder.background },
        style,
      ]}
    >
      <Image
        style={StyleSheet.absoluteFill}
        source={
          token
            ? {
                uri: `${API_URL}/identification/${item.id}/image`,
                headers: { Authorization: `Bearer ${token}` },
                // la foto de una identificación no cambia: se cachea por id, no por token.
                cacheKey: `identification-${item.id}`,
              }
            : null
        }
        contentFit="cover"
        transition={150}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    overflow: 'hidden',
  },
});
