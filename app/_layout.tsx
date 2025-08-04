import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/lib/queryClient';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, initialized, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    const inAuthGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    console.log('🧭 Navigation check:', {
      user: !!user,
      segments: segments.join('/'),
      inAuthGroup,
      inTabsGroup,
    });

    const handleNavigation = async () => {
      // If user is not authenticated and not in auth group, redirect to auth
      if (!user && !inAuthGroup) {
        console.log('🔄 Redirecting to auth (no user)');
        router.replace('/(onboarding)/auth');
        return;
      }

      // If user is authenticated, check profile completion
      if (user && !inAuthGroup) {
        try {
          const authStore = useAuthStore.getState();
          const profileStatus = await authStore.checkProfileCompletion();
          
          switch (profileStatus) {
            case 'needs_name':
              console.log('🔄 Redirecting to profile setup (missing name)');
              router.replace('/(onboarding)/profile-setup');
              break;
            case 'needs_shop_address':
              console.log('🔄 Redirecting to shop location (missing address)');
              router.replace('/(onboarding)/shop-location');
              break;
            case 'complete':
              if (!inTabsGroup) {
                console.log('🔄 Redirecting to main app (profile complete)');
                router.replace('/(tabs)');
              }
              break;
          }
        } catch (error) {
          console.error('❌ Error checking profile completion:', error);
          router.replace('/(onboarding)/profile-setup');
        }
      }
    };

    handleNavigation();
  }, [user, segments, initialized, loading, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      <Stack.Screen name="auth/callback" options={{ animation: 'fade' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
export default function RootLayout() {
  useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide splash screen
      SplashScreen.hideAsync();
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </QueryClientProvider>
  );
}
