import AsyncStorage from "@react-native-async-storage/async-storage";

// MongoDB connection string (replace with your actual connection string)
const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";
const MONGODB_URI =
  "mongodb+srv://researchsonals:researchsonals@torismai.4uggb.mongodb.net/";
const DB_NAME = "TouristAI";

// Get the user ID from AsyncStorage
export const getUserId = async () => {
  try {
    // First try to get the user's MongoDB _id
    let userId = await AsyncStorage.getItem("userId");

    // If we don't have it stored, get the user's email and fetch their ID
    if (!userId) {
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        throw new Error("User not logged in");
      }

      try {
        // Instead of calling the API, we'll just store the email as a temporary placeholder
        // The actual MongoDB ID will be used in the backend
        await AsyncStorage.setItem("userId", userEmail);
        userId = userEmail;
        console.log("Using email as user identifier:", userId);
      } catch (error) {
        console.error("Error setting user ID in AsyncStorage:", error);
        throw error;
      }
    }

    return userId;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

// Save travel plans to MongoDB
export const saveTravelPlans = async (travelPlans) => {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = await fetch(`${API_URL}/saveTravelPlans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        plans: travelPlans,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save travel plans");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving travel plans:", error);
    throw error;
  }
};

// Get travel plans from MongoDB
export const getTravelPlans = async () => {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error("User ID not found");
    }

    const response = await fetch(`${API_URL}/getTravelPlans?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch travel plans");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching travel plans:", error);
    throw error;
  }
};
