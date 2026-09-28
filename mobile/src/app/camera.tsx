import { useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';

const MAX_WIDTH = 1024;
import { AuthGuard } from '../components/auth/AuthGuard';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apiClient } from '../services/api';
import { COLORS } from '../config/constants';
import type { Identification } from '../types';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  const pickFrom = async (source: 'camera' | 'library') => {
    reset();

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError(
        source === 'camera'
          ? 'Necesitamos permiso para usar la cámara.'
          : 'Necesitamos permiso para acceder a tus fotos.',
      );
      return;
    }

    const pickerResult =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
          });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      setImageUri(await shrinkIfNeeded(pickerResult.assets[0]));
    }
  };

  const shrinkIfNeeded = async (
    asset: ImagePicker.ImagePickerAsset,
  ): Promise<string> => {
    if (!asset.width || asset.width <= MAX_WIDTH) {
      return asset.uri;
    }

    const context = ImageManipulator.manipulate(asset.uri);
    context.resize({ width: MAX_WIDTH });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.7,
    });
    return saved.uri;
  };

  const identify = async () => {
    if (!imageUri) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', new File(imageUri), 'foto.jpg');

      const data = await apiClient<Identification>(
        '/identification/identify',
        {
          method: 'POST',
          body: formData,
        },
      );
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al identificar la imagen',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScreenHeader title="Cámara" />
        <ScrollView contentContainerStyle={styles.content}>
          {!imageUri && (
            <View style={styles.actions}>
              <Button onPress={() => pickFrom('camera')}>Tomar foto</Button>
              <Button mode="outlined" onPress={() => pickFrom('library')}>
                Elegir de galería
              </Button>
            </View>
          )}

          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}

          {imageUri && !result && (
            <View style={styles.actions}>
              <Button onPress={identify} loading={loading} disabled={loading}>
                Identificar
              </Button>
              <Button mode="text" onPress={reset} disabled={loading}>
                Elegir otra imagen
              </Button>
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          {result && (
            <Card style={styles.resultCard}>
              <View style={styles.resultContent}>
                <Text style={styles.resultTipo}>{result.tipo}</Text>
                <Text style={styles.resultNombre}>{result.nombreComun}</Text>
                <Text style={styles.resultCientifico}>
                  {result.nombreCientifico}
                </Text>
                <Text style={styles.resultDescripcion}>
                  {result.descripcion}
                </Text>
                <Text style={styles.resultMeta}>
                  Familia: {result.familia} · Confianza: {result.nivelConfianza}
                </Text>
                <Button mode="outlined" onPress={reset} style={styles.again}>
                  Identificar otra
                </Button>
              </View>
            </Card>
          )}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    gap: 16,
    alignItems: 'center',
  },
  actions: {
    gap: 12,
    width: '100%',
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
  },
  resultContent: {
    padding: 16,
  },
  resultTipo: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  resultNombre: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  resultCientifico: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  resultDescripcion: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  again: {
    marginTop: 12,
  },
});
