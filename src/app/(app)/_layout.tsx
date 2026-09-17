import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="career-goals" options={{ headerShown: false }} />
      <Stack.Screen name="resumes" options={{ headerShown: false }} />
      <Stack.Screen name="cv-analysis" options={{ headerShown: false }} />
      <Stack.Screen name="interview" options={{ headerShown: false }} />
      <Stack.Screen name="scenarios" options={{ headerShown: false }} />
      <Stack.Screen name="star-builder" options={{ headerShown: false }} />
      <Stack.Screen name="growth" options={{ headerShown: false }} />
      <Stack.Screen name="pricing" options={{ headerShown: false }} />
    </Stack>
  );
}
