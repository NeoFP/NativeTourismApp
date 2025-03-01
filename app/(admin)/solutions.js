import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://ec2-13-50-235-60.eu-north-1.compute.amazonaws.com:5001";

export default function Solutions() {
  const { theme, isDark } = useTheme();
  const [solutions, setSolutions] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawApiResponse, setRawApiResponse] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const getHotelData = async () => {
      try {
        const storedHotelName = await AsyncStorage.getItem("hotelName");
        if (storedHotelName && storedHotelName.trim() !== "") {
          setHotelName(storedHotelName);
          fetchSolutions(storedHotelName);
        } else {
          // Use a default hotel name for testing if none is found
          const defaultHotelName = "Araliya Green Hills Hotel";
          console.log("No hotel name found, using default:", defaultHotelName);
          setHotelName(defaultHotelName);
          fetchSolutions(defaultHotelName);

          // Also store this default for future use
          await AsyncStorage.setItem("hotelName", defaultHotelName);
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        setError("Failed to load hotel data");
        setLoading(false);
      }
    };

    getHotelData();
  }, []);

  const fetchSolutions = async (hotel) => {
    setLoading(true);
    setError("");

    try {
      // Validate hotel name before making the request
      if (!hotel || hotel.trim() === "") {
        throw new Error("Hotel name cannot be empty");
      }

      const encodedHotelName = encodeURIComponent(hotel.trim());
      console.log("Fetching solutions for hotel:", hotel);
      console.log(
        "API URL:",
        `${API_URL}/generate_solutions?hotel_name=${encodedHotelName}`
      );

      let data;

      // Handle web platform differently due to CORS
      if (Platform.OS === "web") {
        console.log("Running on web platform, handling CORS for solutions...");

        try {
          // Direct approach first - this might work if CORS is configured on the server
          console.log("Trying direct fetch first...");
          const directResponse = await fetch(
            `${API_URL}/generate_solutions?hotel_name=${encodedHotelName}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          if (directResponse.ok) {
            data = await directResponse.json();
            console.log("Direct fetch successful for solutions");
          } else {
            throw new Error("Direct fetch failed");
          }
        } catch (directError) {
          console.log("Direct fetch failed:", directError.message);

          try {
            // Try with axios
            console.log("Trying with axios for solutions...");
            const axiosResponse = await axios.get(
              `${API_URL}/generate_solutions?hotel_name=${encodedHotelName}`
            );

            if (axiosResponse.status === 200) {
              data = axiosResponse.data;
              console.log("Axios approach successful for solutions");
            } else {
              throw new Error(
                `Axios request failed with status ${axiosResponse.status}`
              );
            }
          } catch (axiosError) {
            console.log("Axios approach failed:", axiosError.message);

            // For web testing, use mock data that matches the expected API response
            console.log("Using mock data for web testing due to CORS issues");
            data = {
              Issues: [
                "Cleanliness and sanitation issues in rooms and common areas",
                "Poor breakfast quality and limited options",
                "Outdated and uncomfortable facilities and furniture",
                "Pet-related concerns and lack of pet-free rooms",
                "Poor customer service and slow front desk operations",
                "Maintenance issues such as plumbing, electrical, and structural problems",
                "Noise disturbances due to thin walls and lack of soundproofing",
                "Misleading pricing and promotional practices",
                "Lack of air conditioning and basic room amenities",
                "Inadequate communication about construction and renovations",
              ],
              Solutions: [
                "Improve housekeeping standards to ensure rooms are clean, dust-free, and well-maintained.",
                "Upgrade breakfast offerings to include a wider variety of fresh, high-quality options served on proper dishware.",
                "Implement a clear pet policy and offer pet-free rooms for guests with allergies or preferences.",
                "Renovate outdated facilities, including furniture, bathrooms, and common areas, to enhance guest comfort.",
                "Enhance customer service training for front desk staff to improve efficiency and friendliness.",
                "Ensure all rooms are equipped with basic amenities such as air conditioning, refrigerators, and functioning appliances.",
                "Address and rectify maintenance issues promptly, including plumbing, electrical, and structural concerns.",
                "Provide clear communication about ongoing construction or renovations on the hotel's website and at booking.",
                "Implement soundproofing measures to reduce noise disturbances between rooms.",
                "Offer transparent pricing and promotions to avoid misunderstandings and ensure guest satisfaction.",
              ],
            };
          }
        }
      } else {
        // Native platforms don't have CORS issues
        console.log(
          "Running on native platform, using standard fetch for solutions"
        );
        const response = await fetch(
          `${API_URL}/generate_solutions?hotel_name=${encodedHotelName}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API request failed with status ${response.status}: ${errorText}`
          );
        }

        data = await response.json();
      }

      console.log("Fetched solutions successfully:", data);

      // Store the raw API response for debugging
      setRawApiResponse(data);

      // Ensure the data has the expected structure
      if (!data || !data.Solutions || !data.Issues) {
        throw new Error("Invalid data format received from API");
      }

      // Transform the solutions data to match our component's expected format
      // Don't limit or truncate any data
      const formattedSolutions = data.Solutions.map((solution, index) => ({
        id: (index + 1).toString(),
        issue: data.Issues[index] || "General issue", // Match with corresponding issue or use default
        solution: solution,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }));

      setSolutions(formattedSolutions);
    } catch (error) {
      console.error("Error fetching solutions:", error);
      setError(`Failed to load solutions: ${error.message}`);

      // Use mock data as fallback
      const mockData = [
        {
          id: "1",
          issue: "Poor Wi-Fi connectivity",
          solution: "Upgrade router firmware and add more access points",
          date: "Mar 15, 2024",
        },
        {
          id: "2",
          issue: "Lack of vegetarian food options",
          solution:
            "Introduce new vegetarian menu items and clearly label them",
          date: "Mar 10, 2024",
        },
        {
          id: "3",
          issue: "Insufficient parking space",
          solution: "Implement valet parking service during peak hours",
          date: "Mar 20, 2024",
        },
        {
          id: "4",
          issue: "Noisy air conditioning",
          solution: "Schedule regular maintenance and replace old units",
          date: "Mar 25, 2024",
        },
        {
          id: "5",
          issue: "Long check-in process",
          solution:
            "Implement mobile check-in and increase staff during peak hours",
          date: "Mar 05, 2024",
        },
      ];

      setSolutions(mockData);

      // Create a mock API response for debugging
      setRawApiResponse({
        Issues: [
          "Poor Wi-Fi connectivity",
          "Lack of vegetarian food options",
          "Insufficient parking space",
          "Noisy air conditioning",
          "Long check-in process",
        ],
        Solutions: mockData.map((item) => item.solution),
      });
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
      marginTop: 12,
    },
    hotelName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 24,
    },
    cardContainer: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    blurContainer: {
      overflow: "hidden",
      borderRadius: 16,
    },
    solutionItem: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    solutionContent: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    issueTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    date: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    solutionText: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      color: "#EF4444",
      textAlign: "center",
      marginBottom: 20,
    },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.primary + "20",
      marginTop: 16,
    },
    refreshButtonText: {
      color: theme.primary,
      fontWeight: "600",
      marginLeft: 8,
    },
    debugButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      borderRadius: 8,
      backgroundColor: isDark
        ? "rgba(99, 102, 241, 0.2)"
        : "rgba(99, 102, 241, 0.1)",
      marginTop: 8,
    },
    debugButtonText: {
      color: theme.primary,
      fontWeight: "500",
      fontSize: 12,
      marginLeft: 4,
    },
    debugContainer: {
      marginTop: 20,
      padding: 16,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
      marginBottom: 20,
    },
    debugTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    debugText: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 12,
      color: isDark ? "#A3E635" : "#4B5563",
      marginBottom: 8,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
  });

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInLeft.duration(400).delay(index * 100)}
      style={styles.cardContainer}
    >
      <BlurView
        intensity={isDark ? 20 : 60}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
            isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.02)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.solutionItem}
        >
          <View style={styles.solutionContent}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="zap" size={24} color={theme.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.issueTitle}>{item.issue}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <Text style={styles.solutionText} numberOfLines={null}>
              {item.solution}
            </Text>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  const renderDebugSection = () => {
    if (!showDebug) return null;

    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>API Response Debug Info</Text>
        <ScrollView style={{ maxHeight: 300 }}>
          <Text style={styles.debugText}>
            {rawApiResponse
              ? JSON.stringify(rawApiResponse, null, 2)
              : "No API response data available"}
          </Text>
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16 }}>
          Loading solutions...
        </Text>
      </View>
    );
  }

  if (error && solutions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchSolutions(hotelName)}
        >
          <Feather name="refresh-cw" size={16} color={theme.primary} />
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Solutions Hub</Text>
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => setShowDebug(!showDebug)}
        >
          <Feather name="code" size={14} color={theme.primary} />
          <Text style={styles.debugButtonText}>
            {showDebug ? "Hide Debug" : "Show Debug"}
          </Text>
        </TouchableOpacity>
      </View>

      {hotelName && <Text style={styles.hotelName}>{hotelName}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {renderDebugSection()}

      <FlatList
        data={solutions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
