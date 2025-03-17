import { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  FadeInDown,
  FadeInRight,
  SlideInRight,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  FadeInUp,
} from "react-native-reanimated";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import axios from "axios";

const { width } = Dimensions.get("window");
const API_URL = "http://ec2-13-50-235-60.eu-north-1.compute.amazonaws.com:5001";

export default function Login() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginType, setLoginType] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const floatAnimation = useSharedValue(0);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: "",
  });

  // Add refs for Lottie animations
  const loginAnimationRef = useRef(null);
  const loadingAnimationRef = useRef(null);

  useEffect(() => {
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(-10, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  // Clear validation errors when input changes
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

  const balloonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnimation.value }],
  }));

  const validateInputs = () => {
    let isValid = true;
    const newValidationErrors = {
      email: "",
      password: "",
    };

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
    }

    setValidationErrors(newValidationErrors);
    return isValid;
  };

  const handleLogin = async () => {
    setError("");

    // Validate inputs first
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setShowLoadingModal(true);

    try {
      // Create a clean payload object
      const payload = {
        email: email.trim(),
        password: password,
        type: loginType,
      };

      console.log("Attempting to login with:", {
        email: email.trim(),
        type: loginType,
      });

      // Add detailed console log of the exact payload being sent to the API
      console.log("Login API Payload:", JSON.stringify(payload, null, 2));
      console.log("Login URL:", `${API_URL}/login`);

      let response;
      let data;

      // Handle web platform differently due to CORS
      if (Platform.OS === "web") {
        console.log("Running on web platform, handling CORS...");

        // Try multiple approaches for web
        try {
          // Approach 1: Use a proxy service (if available)
          const proxyUrl = "https://cors-anywhere.herokuapp.com/";
          console.log("Trying with CORS proxy...");
          console.log("Proxy URL:", `${proxyUrl}${API_URL}/login`);

          response = await fetch(`${proxyUrl}${API_URL}/login`, {
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
            console.log("Proxy approach successful");
            console.log("Login response data:", data);
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
            console.log("no-cors URL:", `${API_URL}/login`);
            console.log("no-cors payload:", JSON.stringify(payload, null, 2));

            // Note: no-cors mode won't give us access to the response data
            // This is mostly to see if the request goes through at all
            await fetch(`${API_URL}/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              mode: "no-cors",
            });

            // Since we can't read the response with no-cors,
            // we'll make an assumption that if it didn't throw,
            // the login might have succeeded

            console.log(
              "no-cors request completed, attempting direct navigation"
            );

            // Store user data with assumptions
            await AsyncStorage.setItem("userEmail", email.trim());
            await AsyncStorage.setItem("userType", loginType);
            await AsyncStorage.setItem(
              "username",
              email.split("@")[0] || "User"
            );

            // Add hotel name extraction for hotel type users
            if (loginType === "hotel") {
              // Extract hotel name from email (before the @ symbol) or use a default
              const emailParts = email.split("@");
              let hotelName = "";

              if (emailParts.length > 0 && emailParts[0]) {
                // Convert email username to a proper name format (capitalize first letter of each word)
                hotelName =
                  emailParts[0]
                    .replace(/[._-]/g, " ") // Replace dots, underscores, hyphens with spaces
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ") + " Hotel";
              } else {
                // Use email part as hotel name instead of default
                hotelName = email.split("@")[0] + " Hotel";
              }

              console.log("Storing hotel name from email:", hotelName);
              await AsyncStorage.setItem("hotelName", hotelName);
            }

            // Navigate based on user type
            if (loginType === "hotel") {
              router.replace("/(admin)");
            } else {
              router.replace("/(user)");
            }

            return; // Exit early since we're navigating
          } catch (noCorsError) {
            console.log("no-cors approach failed:", noCorsError.message);

            // Final fallback: Display a special message for web users
            throw new Error("CORS_BLOCKED");
          }
        }
      } else {
        // Native platforms don't have CORS issues
        console.log("Running on native platform, using standard fetch");
        console.log("Native fetch URL:", `${API_URL}/login`);
        console.log("Native fetch payload:", JSON.stringify(payload, null, 2));

        response = await fetch(`${API_URL}/login`, {
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
            `Login failed with status ${response.status}: ${errorText}`
          );
        }

        data = await response.json();
        console.log("Native fetch successful, data:", data);
      }

      // Process successful response data
      const { type, name } = data || {};
      const userEmail = email; // Use email from form

      setRole(type || loginType);
      setWelcomeMessage({
        title: "Welcome to TravelEase",
        message: "Your gateway to seamless travel experiences",
        features: ["Experience the future of travel management"],
      });

      // Store user data
      await AsyncStorage.setItem("userEmail", userEmail);
      await AsyncStorage.setItem("userType", type || loginType);
      await AsyncStorage.setItem(
        "username",
        name || email.split("@")[0] || "User"
      );

      // Store hotel name if user is a hotel
      if ((type || loginType) === "hotel") {
        // Use the name from response or email as fallback
        let hotelName = name || "";

        // If no name was provided in the response, use a default format
        if (!hotelName || hotelName.trim() === "") {
          // Extract hotel name from email (before the @ symbol) or use a default
          const emailParts = email.split("@");
          if (emailParts.length > 0 && emailParts[0]) {
            // Convert email username to a proper name format (capitalize first letter of each word)
            hotelName =
              emailParts[0]
                .replace(/[._-]/g, " ") // Replace dots, underscores, hyphens with spaces
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ") + " Hotel";
          } else {
            // Use email part as hotel name instead of default
            hotelName = email.split("@")[0] + " Hotel";
          }
        }

        await AsyncStorage.setItem("hotelName", hotelName);
        console.log("Stored hotel name:", hotelName);
      }

      // Wait a bit before navigation
      setTimeout(() => {
        setIsLoading(false);
        setShowLoadingModal(false);
        // Navigate based on user type
        if ((type || loginType) === "hotel") {
          router.replace("/(admin)");
        } else {
          router.replace("/(user)");
        }
      }, 1500);
    } catch (error) {
      console.error("Login error:", error.message);
      console.log("Error type:", error.constructor.name);

      if (error.response) {
        console.log("Error response status:", error.response.status);
        console.log("Error response data:", error.response.data);
      }

      if (error.request) {
        console.log("Error request details:", error.request);
      }

      setShowLoadingModal(false);

      // Set a user-friendly error message
      if (error.message === "CORS_BLOCKED") {
        setError(
          "Cannot connect to the server due to CORS restrictions. Please try using the mobile app instead, or contact your administrator to enable CORS on the server."
        );
      } else if (error.message.includes("'email'")) {
        setError("Email is required. Please check your input.");
      } else if (error.message.includes("'type'")) {
        setError("Account type is required. Please select Tourist or Hotel.");
      } else if (
        error.message.includes("CORS") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Network error: Cannot connect to the server. If you're on web, this might be due to CORS restrictions."
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }

      setIsLoading(false);
    }
  };

  // Add useEffect to handle Lottie animation initialization
  useEffect(() => {
    // Small delay to ensure components are properly mounted
    const timer = setTimeout(() => {
      if (loginAnimationRef.current) {
        loginAnimationRef.current.reset();
        loginAnimationRef.current.play();
      }
      if (loadingAnimationRef.current && showLoadingModal) {
        loadingAnimationRef.current.reset();
        loadingAnimationRef.current.play();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [showLoadingModal]);

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
          <View style={styles.lottieContainer}>
            <LottieView
              ref={loginAnimationRef}
              source={require("../../assets/animations/login-animation.json")}
              autoPlay={false} // We'll control play manually with the ref
              loop
              style={styles.loginAnimation}
              resizeMode="contain"
              renderMode="svg"
              speed={0.8} // Slow down animation slightly
              onLayout={() => {
                // Play animation after layout is complete
                if (loginAnimationRef.current) {
                  loginAnimationRef.current.play();
                }
              }}
            />
          </View>

          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Animated.Text
                entering={SlideInRight.duration(800).delay(400)}
                style={[styles.welcomeText, { color: theme.textSecondary }]}
              >
                Welcome to
              </Animated.Text>
              <Animated.Text
                entering={SlideInRight.duration(800).delay(600)}
                style={[styles.title, { color: theme.text }]}
              >
                TravelEase
              </Animated.Text>
              <Animated.Text
                entering={FadeInRight.duration(800).delay(800)}
                style={[styles.subtitle, { color: theme.textSecondary }]}
              >
                Your gateway to seamless travel experiences
              </Animated.Text>
            </View>
          </View>

          <Animated.View
            entering={FadeInDown.duration(1000).delay(1000)}
            style={styles.form}
          >
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Email
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: isDark ? theme.background : "#F9FAFB",
                    borderWidth: 1,
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
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                    borderWidth: 1,
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
                  placeholder="Enter your password"
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
                    loginType === "user" && [
                      styles.activeTypeButton,
                      { backgroundColor: theme.primary + "30" },
                    ],
                  ]}
                  onPress={() => setLoginType("user")}
                >
                  <Feather
                    name="user"
                    size={20}
                    color={
                      loginType === "user" ? theme.primary : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          loginType === "user"
                            ? theme.primary
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Tourist
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    loginType === "hotel" && [
                      styles.activeTypeButton,
                      { backgroundColor: theme.primary + "30" },
                    ],
                  ]}
                  onPress={() => setLoginType("hotel")}
                >
                  <Feather
                    name="home"
                    size={20}
                    color={
                      loginType === "hotel"
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.typeText,
                      {
                        color:
                          loginType === "hotel"
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
              onPress={handleLogin}
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
                    <Text style={styles.buttonText}>Sign In</Text>
                    <Feather name="arrow-right" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.registerLink}
            >
              <Text
                style={[styles.registerText, { color: theme.textSecondary }]}
              >
                Don't have an account?{" "}
                <Text style={{ color: theme.primary, fontWeight: "600" }}>
                  Sign Up
                </Text>
              </Text>
            </TouchableOpacity>

            <Animated.Text
              entering={FadeInRight.duration(800).delay(1200)}
              style={[styles.footerText, { color: theme.textSecondary }]}
            >
              Experience the future of travel management
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      <Modal transparent visible={showLoadingModal} animationType="fade">
        <BlurView
          intensity={isDark ? 20 : 60}
          tint={isDark ? "dark" : "light"}
          style={styles.modalContainer}
        >
          <View style={styles.loadingContainer}>
            <LottieView
              ref={loadingAnimationRef}
              source={require("../../assets/animations/travel-loading.json")}
              autoPlay={false} // We'll control play manually with the ref
              loop
              style={styles.lottieAnimation}
              renderMode="svg"
              speed={0.8} // Slow down animation slightly
              onLayout={() => {
                // Play animation after layout is complete
                if (loadingAnimationRef.current) {
                  loadingAnimationRef.current.play();
                }
              }}
            />
            {welcomeMessage && (
              <Animated.Text
                entering={FadeInUp.springify()}
                style={[styles.loadingTitle, { color: theme.text }]}
              >
                {welcomeMessage.title}
              </Animated.Text>
            )}
            <Animated.Text
              entering={FadeInUp.springify()}
              style={[styles.loadingText, { color: theme.text }]}
            >
              {welcomeMessage ? welcomeMessage.message : "Signing you in..."}
            </Animated.Text>
            {welcomeMessage && (
              <View style={styles.featuresContainer}>
                {welcomeMessage.features.map((feature, index) => (
                  <Animated.Text
                    key={index}
                    entering={FadeInUp.springify().delay(200 * index)}
                    style={[styles.featureText, { color: theme.textSecondary }]}
                  >
                    • {feature}
                  </Animated.Text>
                ))}
              </View>
            )}
          </View>
        </BlurView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  titleContainer: {
    alignItems: "center",
    gap: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 22,
  },
  form: {
    gap: 24,
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
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
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
  footerText: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
    opacity: 0.8,
  },
  lottieContainer: {
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
    height: Platform.OS === "web" ? 250 : 200,
    width: "100%",
    position: "relative",
  },
  loginAnimation: {
    width: 200,
    height: 200,
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
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
  validationErrorText: {
    color: "#EF4444",
    fontSize: 12,
    marginLeft: 4,
    marginTop: 4,
  },
  registerLink: {
    marginTop: 20,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  featuresContainer: {
    marginTop: 16,
    alignItems: "flex-start",
  },
  featureText: {
    fontSize: 14,
    marginVertical: 4,
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
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});
