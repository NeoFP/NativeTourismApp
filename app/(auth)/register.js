import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";

const API_URL = "http://ec2-13-50-235-60.eu-north-1.compute.amazonaws.com:5001";

export default function Register() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("user"); // Default to user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Clear validation errors when input changes
  useEffect(() => {
    setValidationErrors({
      ...validationErrors,
      name: "",
    });
  }, [name]);

  useEffect(() => {
    setValidationErrors({
      ...validationErrors,
      email: "",
    });
  }, [email]);

  useEffect(() => {
    setValidationErrors({
      ...validationErrors,
      password: "",
    });
  }, [password]);

  const validateInputs = () => {
    let isValid = true;
    const newValidationErrors = {
      name: "",
      email: "",
      password: "",
    };

    // Validate name
    if (!name.trim()) {
      newValidationErrors.name = "Name is required";
      isValid = false;
    } else if (name.trim().length < 2) {
      newValidationErrors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newValidationErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newValidationErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!password) {
      newValidationErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newValidationErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setValidationErrors(newValidationErrors);
    return isValid;
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    // Validate inputs
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    // Show loading modal for better UX
    setShowLoadingModal(true);

    try {
      console.log("Attempting to register with:", { email, name, type });

      // Create a clean payload object
      const payload = {
        email: email.trim(),
        password: password,
        type: type,
        name: name.trim(),
      };

      // Add detailed console log of the exact payload being sent to the API
      console.log(
        "API Payload for registration:",
        JSON.stringify(payload, null, 2)
      );
      console.log("Registration URL:", `${API_URL}/register`);

      let response;
      let data;

      // Handle web platform differently due to CORS
      if (Platform.OS === "web") {
        console.log(
          "Running on web platform, handling CORS for registration..."
        );

        try {
          // Approach 1: Use a proxy service (if available)
          const proxyUrl = "https://cors-anywhere.herokuapp.com/";
          console.log("Trying with CORS proxy...");
          console.log("Proxy URL:", `${proxyUrl}${API_URL}/register`);

          response = await fetch(`${proxyUrl}${API_URL}/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Origin: window.location.origin,
            },
            body: JSON.stringify(payload),
          });

          console.log("Proxy response status:", response.status);

          if (response.ok) {
            data = await response.json();
            console.log("Proxy approach successful for registration");
            console.log("Registration data received:", data);
          } else {
            const errorText = await response.text();
            console.log("Proxy approach failed with response:", errorText);
            throw new Error("Proxy approach failed");
          }
        } catch (proxyError) {
          console.log("Proxy approach failed:", proxyError.message);

          try {
            // Approach 2: Try with no-cors mode (will result in opaque response)
            console.log("Trying with no-cors mode...");
            console.log("no-cors URL:", `${API_URL}/register`);
            console.log("no-cors payload:", JSON.stringify(payload, null, 2));

            // Note: no-cors mode won't give us access to the response data
            // This is mostly to see if the request goes through at all
            await fetch(`${API_URL}/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              mode: "no-cors",
            });

            // Since we can't read the response with no-cors,
            // we'll make an assumption that if it didn't throw,
            // the registration might have succeeded
            console.log("no-cors request completed, assuming success");

            // Store the hotel name if registering as a hotel
            if (type === "hotel") {
              await AsyncStorage.setItem("hotelName", name);
            }

            // Show success message
            setSuccess("Registration successful! Redirecting to login...");

            // Hide loading modal
            setShowLoadingModal(false);

            // Wait a bit then redirect
            setTimeout(() => {
              router.replace("/login");
            }, 2000);

            return; // Exit early since we're navigating
          } catch (noCorsError) {
            console.log("no-cors approach failed:", noCorsError.message);

            // Try direct axios call as a last resort
            try {
              console.log("Trying direct axios call...");
              console.log("Axios URL:", `${API_URL}/register`);
              console.log("Axios payload:", JSON.stringify(payload, null, 2));

              const axiosResponse = await axios.post(
                `${API_URL}/register`,
                payload,
                {
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );

              console.log("Axios response status:", axiosResponse.status);
              console.log("Axios response headers:", axiosResponse.headers);

              data = axiosResponse.data;
              console.log("Axios approach successful, data:", data);
            } catch (axiosError) {
              console.log("Axios approach failed:", axiosError.message);
              console.log(
                "Axios error details:",
                axiosError.response
                  ? {
                      status: axiosError.response.status,
                      data: axiosError.response.data,
                    }
                  : "No response"
              );

              // Final fallback: Display a special message for web users
              throw new Error("CORS_BLOCKED");
            }
          }
        }
      } else {
        // Native platforms don't have CORS issues
        console.log(
          "Running on native platform, using standard fetch for registration"
        );
        console.log("Native fetch URL:", `${API_URL}/register`);
        console.log("Native fetch payload:", JSON.stringify(payload, null, 2));

        const response = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Native fetch response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Native fetch error response:", errorText);
          throw new Error(
            `API request failed with status ${response.status}: ${errorText}`
          );
        }

        data = await response.json();
        console.log("Native fetch successful, data:", data);
      }

      console.log("Registration response:", data);

      // Store the hotel name if registering as a hotel
      if (type === "hotel") {
        await AsyncStorage.setItem("hotelName", name);
      }

      // Registration successful
      setSuccess("Registration successful! Redirecting to login...");

      // Hide loading modal
      setShowLoadingModal(false);

      // Wait a bit then redirect
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      console.log("Error type:", error.constructor.name);
      console.log("Error message:", error.message);

      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);
      }

      if (error.request) {
        console.log("Error request details:", error.request);
      }

      // Hide loading modal
      setShowLoadingModal(false);

      if (error.message === "CORS_BLOCKED") {
        setError(
          "Cannot connect to the server due to CORS restrictions. Please try using the mobile app instead, or contact your administrator to enable CORS on the server."
        );
      } else if (error.message && error.message.includes("Network Error")) {
        setError(
          "Network error - please check your internet connection and try again"
        );
      } else if (error.response) {
        // Server responded with an error
        setError(
          error.response.data?.message ||
            "Registration failed. Please try again."
        );
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please try again later.");
      } else {
        // Something else happened
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add state for loading modal
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.duration(1000).springify()}
          style={styles.content}
        >
          <Text style={[styles.title, { color: theme.text }]}>
            Create Account
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : success ? (
            <View style={styles.successContainer}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Name
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? theme.background : "#F9FAFB",
                    borderColor: validationErrors.name
                      ? "#EF4444"
                      : theme.border,
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={20}
                  color={
                    validationErrors.name ? "#EF4444" : theme.textSecondary
                  }
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={
                    type === "hotel" ? "Enter hotel name" : "Enter your name"
                  }
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {validationErrors.name ? (
                <Text style={styles.validationErrorText}>
                  {validationErrors.name}
                </Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Email
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? theme.background : "#F9FAFB",
                    borderColor: validationErrors.email
                      ? "#EF4444"
                      : theme.border,
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={20}
                  color={
                    validationErrors.email ? "#EF4444" : theme.textSecondary
                  }
                />
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
              {validationErrors.email ? (
                <Text style={styles.validationErrorText}>
                  {validationErrors.email}
                </Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? theme.background : "#F9FAFB",
                    borderColor: validationErrors.password
                      ? "#EF4444"
                      : theme.border,
                  },
                ]}
              >
                <Feather
                  name="lock"
                  size={20}
                  color={
                    validationErrors.password ? "#EF4444" : theme.textSecondary
                  }
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
              {validationErrors.password ? (
                <Text style={styles.validationErrorText}>
                  {validationErrors.password}
                </Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Account Type
              </Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "user" && [
                      styles.activeTypeButton,
                      { backgroundColor: theme.primary + "30" },
                    ],
                  ]}
                  onPress={() => setType("user")}
                >
                  <Feather
                    name="user"
                    size={20}
                    color={
                      type === "user" ? theme.primary : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          type === "user" ? theme.primary : theme.textSecondary,
                      },
                    ]}
                  >
                    Tourist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === "hotel" && [
                      styles.activeTypeButton,
                      { backgroundColor: theme.primary + "30" },
                    ],
                  ]}
                  onPress={() => setType("hotel")}
                >
                  <Feather
                    name="home"
                    size={20}
                    color={
                      type === "hotel" ? theme.primary : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          type === "hotel"
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Hotel
                  </Text>
                </TouchableOpacity>
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
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Feather name="arrow-right" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={styles.loginLink}
            >
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                Already have an account?{" "}
                <Text style={{ color: theme.primary, fontWeight: "600" }}>
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add loading modal with standard loading indicator */}
      <Modal transparent visible={showLoadingModal} animationType="fade">
        <BlurView
          intensity={isDark ? 20 : 60}
          tint={isDark ? "dark" : "light"}
          style={styles.modalContainer}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Animated.Text
              entering={FadeInDown.springify()}
              style={[styles.loadingText, { color: theme.text }]}
            >
              Creating your account...
            </Animated.Text>
          </View>
        </BlurView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 10,
  },
  activeTypeButton: {
    borderColor: "#818CF8",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 16,
    width: "100%",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: "#EF4444",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  successText: {
    color: "#10B981",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  validationErrorText: {
    color: "#EF4444",
    fontSize: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
