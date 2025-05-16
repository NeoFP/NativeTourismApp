import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userType = await AsyncStorage.getItem("userType");
      const userEmail = await AsyncStorage.getItem("userEmail");

      // If user is logged in, go to tabs, otherwise auth
      if (userEmail) {
        // Send to tabs if authenticated
        setInitialRoute("/(tabs)");
      } else {
        // If userType is set but no email, go to appropriate non-tab section
        setInitialRoute(userType ? `/(${userType})` : "/(auth)/login");
      }
    } catch (error) {
      setInitialRoute("/(auth)/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Redirect href={initialRoute} />;
}
