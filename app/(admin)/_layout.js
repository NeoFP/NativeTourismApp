import { Tabs } from 'expo-router';
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ 
              marginRight: 16,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${theme.primary}20`,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Feather 
              name="log-out" 
              size={16} 
              color={theme.primary}
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="issues"
        options={{
          title: 'Issues',
          tabBarIcon: ({ color, size }) => (
            <Feather name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="solutions"
        options={{
          title: 'Solutions',
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
} 