import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="diabetes-profile" />
    </Stack>
  );
}
