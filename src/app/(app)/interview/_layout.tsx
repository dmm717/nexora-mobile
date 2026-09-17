import { Stack } from 'expo-router';

export default function InterviewLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="preflight" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="report/[id]" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
