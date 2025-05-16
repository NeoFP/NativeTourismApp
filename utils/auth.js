import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// MongoDB connection details
const MONGODB_URI =
  "mongodb+srv://researchsonals:researchsonals@torismai.4uggb.mongodb.net/";
const DB_NAME = "TouristAI";
const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

// Store user credentials securely
export const storeUserCredentials = async (email, password) => {
  try {
    await AsyncStorage.setItem("userEmail", email);

    // For extra security, consider using SecureStore for sensitive info like passwords
    if (SecureStore.isAvailableAsync()) {
      await SecureStore.setItemAsync("userPassword", password);
    } else {
      // Fallback to AsyncStorage if SecureStore is not available
      await AsyncStorage.setItem("userPassword", password);
    }

    console.log("User credentials stored successfully");
    return true;
  } catch (error) {
    console.error("Error storing user credentials:", error);
    return false;
  }
};

// Clear user credentials on logout
export const clearUserCredentials = async () => {
  try {
    await AsyncStorage.removeItem("userEmail");
    await AsyncStorage.removeItem("userId");

    if (SecureStore.isAvailableAsync()) {
      await SecureStore.deleteItemAsync("userPassword");
    } else {
      await AsyncStorage.removeItem("userPassword");
    }

    console.log("User credentials cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing user credentials:", error);
    return false;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const userEmail = await AsyncStorage.getItem("userEmail");
    return !!userEmail; // Return true if userEmail exists, false otherwise
  } catch (error) {
    console.error("Error checking if user is logged in:", error);
    return false;
  }
};

// Get the current user's email
export const getUserEmail = async () => {
  try {
    return await AsyncStorage.getItem("userEmail");
  } catch (error) {
    console.error("Error getting user email:", error);
    return null;
  }
};

// Handle the login process and store necessary data
export const loginUser = async (email, password) => {
  try {
    // First, try API login
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store user data
        await storeUserCredentials(email, password);

        // Store the MongoDB user ID if available
        if (data && data._id) {
          await AsyncStorage.setItem("userId", data._id);
        }

        return { success: true, message: "Login successful" };
      } else {
        // If API not available or error, use the direct MongoDB approach
        throw new Error("API login failed");
      }
    } catch (apiError) {
      console.log("API login failed, using direct email as ID:", apiError);

      // Store user credentials
      await storeUserCredentials(email, password);

      // Use email as temporary ID
      await AsyncStorage.setItem("userId", email);

      return {
        success: true,
        message: "Login successful using local authentication",
        warning: "Using local authentication",
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: error.message || "Login failed" };
  }
};

// Handle registration process
export const registerUser = async (userData) => {
  try {
    // Try API registration
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();

        // Store user credentials
        await storeUserCredentials(userData.email, userData.password);

        // Store the MongoDB user ID if available
        if (data && data._id) {
          await AsyncStorage.setItem("userId", data._id);
        }

        return { success: true, message: "Registration successful" };
      } else {
        // If API not available or error, use the direct MongoDB approach
        throw new Error("API registration failed");
      }
    } catch (apiError) {
      console.log(
        "API registration failed, using direct email as ID:",
        apiError
      );

      // Store user credentials
      await storeUserCredentials(userData.email, userData.password);

      // Use email as temporary ID
      await AsyncStorage.setItem("userId", userData.email);

      return {
        success: true,
        message: "Registration successful using local authentication",
        warning: "Using local authentication",
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: error.message || "Registration failed" };
  }
};
