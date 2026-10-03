import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { AuthGuard } from '../components/auth/AuthGuard';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { Button } from '../components/ui/Button';
import { IdentificationResult } from '../components/identification/IdentificationResult';
import { apiClient } from '../services/api';
import { COLORS } from '../config/constants';
import type { Identification } from '../types';

const MAX_WIDTH = 1024;

type Source = 'camera' | 'library';

export default function CameraScreen() {
  // el inicio abre esta pantalla con ?source=camera|library para ir directo al selector.
  const { source: initialSource } = useLocalSearchParams<{ source?: Source }>();
  const router = useRouter();
  const launched = useRef(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Identification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setImageUri(null);
    setResult(null);
    setError(null);
  };

  const pickFrom = async (source: Source) => {
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

  useEffect(() => {
    if (launched.current) return;
    launched.current = true;
    if (initialSource === 'camera' || initialSource === 'library') {
      pickFrom(initialSource);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ya identificada: ficha completa con la foto que se acaba de sacar.
  if (result && imageUri) {
    return (
      <AuthGuard>
        <IdentificationResult item={result} localImageUri={imageUri}>
          <Button onPress={() => pickFrom('camera')}>Identificar otra</Button>
          <Button mode="text" onPress={() => router.back()}>
            Listo
          </Button>
        </IdentificationResult>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={styles.container}>
        <ScreenHeader title="Nueva identificación" />
        <ScrollView contentContainerStyle={styles.content}>
          {!imageUri && (
            <>
              <View style={styles.intro}>
                <View style={styles.introIcon}>
                  <MaterialCommunityIcons
                    name="leaf"
                    size={36}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.introTitle}>¿Qué encontraste?</Text>
                <Text style={styles.introText}>
                  Sacá una foto de cerca y con buena luz de una planta o un
                  animal.
                </Text>
              </View>
              <View style={styles.sources}>
                <SourceButton
                  icon="camera-outline"
                  label="Tomar foto"
                  onPress={() => pickFrom('camera')}
                />
                <SourceButton
                  icon="image-outline"
                  label="Elegir de galería"
                  onPress={() => pickFrom('library')}
                />
              </View>
            </>
          )}

          {imageUri && (
            <View style={styles.previewFrame}>
              <Image
                source={{ uri: imageUri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              {loading && (
                <View style={styles.analyzing}>
                  <ActivityIndicator color={COLORS.white} />
                  <Text style={styles.analyzingText}>Analizando la foto…</Text>
                </View>
              )}
            </View>
          )}

          {imageUri && (
            <View style={styles.actions}>
              <Button onPress={identify} loading={loading} disabled={loading}>
                Identificar
              </Button>
              <Button mode="text" onPress={reset} disabled={loading}>
                Elegir otra foto
              </Button>
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

interface SourceButtonProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
}

function SourceButton({ icon, label, onPress }: SourceButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.source, pressed && styles.sourcePressed]}
    >
      <MaterialCommunityIcons name={icon} size={30} color={COLORS.primary} />
      <Text style={styles.sourceLabel}>{label}</Text>
    </Pressable>
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
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  introIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  introText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  sources: {
    flexDirection: 'row',
    gap: 12,
  },
  source: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  sourcePressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  previewFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceMuted,
  },
  analyzing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(27, 43, 20, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  analyzingText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  error: {
    color: COLORS.error,
    textAlign: 'center',
  },
});
