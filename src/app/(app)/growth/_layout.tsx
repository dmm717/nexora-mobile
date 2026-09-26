import { Stack } from 'expo-router';

export default function GrowthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="skill-profile" />
      <Stack.Screen name="progress-dashboard" />
      <Stack.Screen name="learning-path" />
    </Stack>
  );
}
