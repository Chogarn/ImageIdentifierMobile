import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config/constants';

// botón central: abre la pantalla de cámara en lugar de cambiar de pestaña.
function CameraTabButton() {
  const router = useRouter();

  return (
    <View style={styles.cameraSlot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Identificar con la cámara"
        onPress={() => router.push('/camera')}
        style={({ pressed }) => [
          styles.cameraButton,
          pressed && styles.cameraButtonPressed,
        ]}
      >
        <MaterialCommunityIcons name="camera" size={26} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 68,
          paddingBottom: 12,
          paddingTop: 4,
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
          headerTitle: 'ImageIdentifier',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
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
        name="profile"
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  cameraButtonPressed: {
    backgroundColor: COLORS.primaryLight,
  },
});
