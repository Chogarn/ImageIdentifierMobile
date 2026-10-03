import { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getToken } from '../../services/api';
import { API_URL, TIPO_STYLE } from '../../config/constants';
import type { Identification } from '../../types';

interface IdentificationImageProps {
  item: Pick<Identification, 'id' | 'tipo' | 'imageFile'>;
  style?: ViewStyle;
  iconSize?: number;
}

// muestra la foto guardada (o un ícono del color del tipo si no hay foto) de una identificación. La pide al backend con el token,
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

  const tipo = TIPO_STYLE[item.tipo] ?? TIPO_STYLE.desconocido;

  if (!item.imageFile || failed) {
    return (
      <View
        style={[
          styles.placeholder,
          { backgroundColor: tipo.strong },
          style,
        ]}
      >
        <MaterialCommunityIcons
          name={tipo.icon}
          size={iconSize}
          color={tipo.text}
        />
      </View>
    );
  }

  // el tamaño/bordes se aplican al contenedor y la foto lo llena.
  return (
    <View
      style={[
        styles.frame,
        { backgroundColor: tipo.strong },
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
