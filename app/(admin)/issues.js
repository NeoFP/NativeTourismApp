import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
  ActivityIndicator,
  Platform,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";
import { Swipeable } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function Issues() {
  const { theme, isDark } = useTheme();
  const [issues, setIssues] = useState([]);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getHotelData = async () => {
      try {
        const storedHotelName = await AsyncStorage.getItem("hotelName");
        if (storedHotelName && storedHotelName.trim() !== "") {
          setHotelName(storedHotelName);
          fetchIssues(storedHotelName);
        } else {
          // Get the user email to extract a hotel name from it
          try {
            const userEmail = await AsyncStorage.getItem("userEmail");
            let derivedHotelName = "";

            if (userEmail) {
              // Extract hotel name from email (before the @ symbol)
              const emailParts = userEmail.split("@");
              if (emailParts.length > 0 && emailParts[0]) {
                // Convert email username to hotel name
                derivedHotelName =
                  emailParts[0]
                    .replace(/[._-]/g, " ") // Replace dots, underscores, hyphens with spaces
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ") + " Hotel";
              } else {
                derivedHotelName = "Your Hotel";
              }
            } else {
              derivedHotelName = "Your Hotel";
            }

            console.log(
              "No hotel name found, using derived name:",
              derivedHotelName
            );
            setHotelName(derivedHotelName);
            fetchIssues(derivedHotelName);

            // Store this derived name for future use
            await AsyncStorage.setItem("hotelName", derivedHotelName);
          } catch (error) {
            console.error("Error deriving hotel name:", error);
            const fallbackName = "Your Hotel";
            setHotelName(fallbackName);
            fetchIssues(fallbackName);
            await AsyncStorage.setItem("hotelName", fallbackName);
          }
        }
      } catch (error) {
        console.error("Error fetching hotel data:", error);
        setError("Failed to load hotel data");
        setLoading(false);
      }
    };

    getHotelData();
  }, []);

  const fetchIssues = async (hotel) => {
    setLoading(true);
    setError("");

    try {
      // Validate hotel name before making the request
      if (!hotel || hotel.trim() === "") {
        throw new Error("Hotel name cannot be empty");
      }

      const encodedHotelName = encodeURIComponent(hotel.trim());
      console.log("Fetching issues for hotel:", hotel);

      let data;

      // Handle web platform differently due to CORS
      if (Platform.OS === "web") {
        console.log("Running on web platform, handling CORS for issues...");

        try {
          // Direct approach first - this might work if CORS is configured on the server
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
          } else {
            throw new Error("Direct fetch failed");
          }
        } catch (directError) {
          try {
            // Try with axios
            const axiosResponse = await axios.get(
              `${API_URL}/generate_solutions?hotel_name=${encodedHotelName}`
            );

            if (axiosResponse.status === 200) {
              data = axiosResponse.data;
            } else {
              throw new Error(
                `Axios request failed with status ${axiosResponse.status}`
              );
            }
          } catch (axiosError) {
            throw new Error(
              "Failed to fetch issues due to CORS restrictions. This feature may not work on web browsers."
            );
          }
        }
      } else {
        // Native platforms don't have CORS issues
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

      // Ensure the data has the expected structure
      if (!data || !data.Issues) {
        image.png;
        throw new Error("Invalid data format received from API");
      }

      // Transform the issues data to match our component's expected format
      const formattedIssues = data.Issues.map((issue, index) => ({
        id: (index + 1).toString(),
        title: issue,
        status: "pending",
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setError(`Failed to load issues: ${error.message}`);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (id) => {
    setIssues((currentIssues) =>
      currentIssues.map((issue) =>
        issue.id === id
          ? {
              ...issue,
              status: issue.status === "pending" ? "resolved" : "pending",
            }
          : issue
      )
    );
  };

  const getStatusColor = (status) => {
    return status === "resolved" ? "#10B981" : "#F59E0B";
  };

  const renderRightActions = (progress, dragX, item) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
    });

    return (
      <RNAnimated.View
        style={[
          styles.swipeableButton,
          {
            transform: [{ translateX: trans }],
            backgroundColor: `${getStatusColor(item.status)}20`,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => toggleStatus(item.id)}
          style={styles.swipeableButtonContent}
        >
          <Feather
            name={item.status === "resolved" ? "x-circle" : "check-circle"}
            size={24}
            color={getStatusColor(item.status)}
          />
          <Text
            style={[
              styles.swipeableButtonText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status === "resolved" ? "Mark Pending" : "Resolve"}
          </Text>
        </TouchableOpacity>
      </RNAnimated.View>
    );
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
    issueItem: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    issueContent: {
      padding: 20,
    },
    textContainer: {
      flex: 1,
    },
    issueTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: "auto",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
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
    swipeableButton: {
      width: 100,
      justifyContent: "center",
      alignItems: "center",
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    },
    swipeableButtonContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    swipeableButtonText: {
      fontSize: 12,
      fontWeight: "600",
      marginTop: 4,
    },
  });

  const renderItem = ({ item, index }) => (
    <Swipeable
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item)
      }
      overshootRight={false}
    >
      <Animated.View
        entering={FadeInRight.duration(400).delay(index * 100)}
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
            style={styles.issueItem}
          >
            <View style={styles.issueContent}>
              <View style={styles.textContainer}>
                <Text style={styles.issueTitle}>{item.title}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status === "resolved" ? "Resolved" : "Pending"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ color: theme.text, marginTop: 16 }}>
          Loading issues...
        </Text>
      </View>
    );
  }

  if (error && issues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchIssues(hotelName)}
        >
          <Feather name="refresh-cw" size={16} color={theme.primary} />
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reported Issues</Text>
      {hotelName && <Text style={styles.hotelName}>{hotelName}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={issues}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
