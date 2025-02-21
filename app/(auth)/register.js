import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import axios from "axios";

const API_URL = Platform.select({
  android: "http://10.0.2.2:5001/api/auth",
  ios: "http://localhost:5001/api/auth",
  default: "http://localhost:5001/api/auth",
});

export default function Register() {
  const { theme, isDark } = useTheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateInputs = () => {
    if (!username) {
      setError("Username is required");
      return false;
    }
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    try {
      if (!validateInputs()) {
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        password,
        role: "user" // Always register as user
      });

      // Registration successful, redirect to login
      router.replace("/login");
    } catch (error) {
      console.error("Registration error:", error);
      if (!error.response) {
        setError("Network error - please check your connection");
      } else {
        setError(
          error.response?.data?.message || "Registration failed"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Animated.View
        entering={FadeInDown.duration(1000).springify()}
        style={styles.content}
      >
        <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Username</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? theme.background : "#F9FAFB" }]}>
              <Feather name="user" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your username"
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? theme.background : "#F9FAFB" }]}>
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? theme.background : "#F9FAFB" }]}>
              <Feather name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Create a password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[theme.primary, "#818CF8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <Feather name="loader" size={24} color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/login")}
            style={styles.loginLink}
          >
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>
              Already have an account? <Text style={{ color: theme.primary }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (similar styles to login.js)
  // Add these specific styles:
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  }
}); 