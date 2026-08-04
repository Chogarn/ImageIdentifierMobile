import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { THEME, COLORS } from '../config/constants';
import { LoadingScreen } from '../components/ui/LoadingScreen';

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login' as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/' as any);
    }
  }, [isAuthenticated, loading, segments, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={THEME}>
        <AuthProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
