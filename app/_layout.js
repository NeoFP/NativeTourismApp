import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { ThemeProvider } from '../utils/ThemeContext';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');
      setInitialRoute(userType ? `/(${userType})` : '/(auth)/login');
    } catch (error) {
      setInitialRoute('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(user)" />
      </Stack>
    </ThemeProvider>
  );
} 