import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { ThemeProvider } from "../utils/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userType = await AsyncStorage.getItem("userType");
      // Map 'hotel' user type to 'admin' route group
      const routeGroup = userType === "hotel" ? "admin" : userType;
      setInitialRoute(userType ? `/(${routeGroup})` : "/(auth)/login");
    } catch (error) {
      setInitialRoute("/(auth)/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (initialRoute) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          {/* Redirect to the appropriate route based on user type */}
          <Redirect href={initialRoute} />
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(admin)" />
            <Stack.Screen name="(user)" />
          </Stack>
        </ThemeProvider>
      </GestureHandlerRootView>
    );
  }
}
