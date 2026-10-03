import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

// botón central: única entrada para identificar. Abre la cámara directo en lugar de cambiar de pestaña.
function CameraTabButton() {
  const router = useRouter();

  return (
    <View style={styles.cameraSlot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Identificar con la cámara"
        onPress={() => router.push('/camera?source=camera')}
        style={({ pressed }) => [
          styles.cameraButton,
          pressed && styles.cameraButtonPressed,
        ]}
      >
        <MaterialCommunityIcons name="camera" size={28} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // cada pantalla dibuja su propio título (diseño claro, sin barra verde).
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 72,
          paddingBottom: 12,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Cámara',
          tabBarButton: () => <CameraTabButton />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Colección',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="bookshelf" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cameraSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cameraButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginTop: -22,
    borderWidth: 4,
    borderColor: COLORS.surface,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  cameraButtonPressed: {
    backgroundColor: COLORS.primaryDark,
  },
});
