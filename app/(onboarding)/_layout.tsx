import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="shop-location" />
      <Stack.Screen name="shop-details" />
    </Stack>
  );
}