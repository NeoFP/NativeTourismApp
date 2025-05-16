import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../utils/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { BarChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function Index() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const [hotelName, setHotelName] = useState("");
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState(null);

  useEffect(() => {
    // Fetch hotel name from AsyncStorage
    const getHotelData = async () => {
      try {
        const storedHotelName = await AsyncStorage.getItem("hotelName");
        if (storedHotelName && storedHotelName.trim() !== "") {
          setHotelName(storedHotelName);
          fetchReviewStats(storedHotelName);
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
            fetchReviewStats(derivedHotelName);

            // Store this derived name for future use
            await AsyncStorage.setItem("hotelName", derivedHotelName);
          } catch (error) {
            console.error("Error deriving hotel name:", error);
            const fallbackName = "Your Hotel";
            setHotelName(fallbackName);
            fetchReviewStats(fallbackName);
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

  // Function to use mock data for testing
  const useMockData = () => {
    setLoading(true);
    setError("");
    setUsingMockData(true);

    // Create realistic mock data with the API response format
    const mockData = {
      bar_plot:
        "https://tourismaiassistant2025.s3.amazonaws.com/b293a89b-de94-4117-8d15-ec460f64d17a.png",
      pie_chart:
        "https://tourismaiassistant2025.s3.amazonaws.com/9a8f2433-3e97-47d9-83aa-4304b5bfa609.png",
      counts: {
        positive: 142,
        neutral: 42,
        negative: 34,
      },
      sample_reviews: {
        positive: [
          "Mysigt med fina rum, bra frukost och nra bde till stranden och btterminalen.",
          "Wunderschne Zimmer, Bademantelgang optimal, Frhstck sehr lecker in gemtlicher Atmosphre. Parkplatz 8 Euro am Tag fr Gste des Hotels zhlt fr mich leider nicht zu gutem Service. sonst alles Bestens",
          "Quiet, friendly staff, no issues",
        ],
        negative: [
          "For the price paid, the level was not there. I have to go to the lobby to explain that the bed was not well make, but no change during 9 nights. The breakfast was very poor during 9 mornings always scramble eggs and sausage or small omelet with grounded pork. We have to eat in plastic dishs and we have to use plastic knife, spoon and fork. I am exhibitor in GJX, so each year I am in Tucson, it was the first and last time I will go in this hotel.",
          "The overpowering odor of MILDEW greeted us upon arrival. The condition of this hotel is below acceptable. Don't even consider the breakfast offered...it is in a cramped space, with few tables, fewer food offerings (just carbs such as stale hard bagels, white bread, cereal), there were hard boiled eggs in the shell (who wants to peel them nor could space... More",
        ],
      },
    };

    // Store the raw response for debugging
    setRawApiResponse(mockData);

    // Set the mock data
    setReviewStats(mockData);
    setLoading(false);

    console.log("Using mock data for testing");
  };

  const fetchReviewStats = async (hotel) => {
    setLoading(true);
    setError("");
    setUsingMockData(false);

    try {
      // Validate hotel name before making the request
      if (!hotel || hotel.trim() === "") {
        throw new Error("Hotel name cannot be empty");
      }

      const encodedHotelName = encodeURIComponent(hotel.trim());
      console.log("Fetching stats for hotel:", hotel);
      console.log(
        "API URL:",
        `${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`
      );

      let data;

      // Handle web platform differently due to CORS
      if (Platform.OS === "web") {
        console.log(
          "Running on web platform, handling CORS for review stats..."
        );

        try {
          // Direct approach first - this might work if CORS is configured on the server
          console.log("Trying direct fetch first...");
          const directResponse = await fetch(
            `${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`,
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
            console.log("Direct fetch successful for review stats");
            // Store the raw response for debugging
            setRawApiResponse(data);
          } else {
            throw new Error("Direct fetch failed");
          }
        } catch (directError) {
          console.log("Direct fetch failed:", directError.message);

          try {
            // Approach 1: Use a proxy service
            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            console.log("Trying with CORS proxy for review stats...");

            const proxyResponse = await fetch(
              `${proxyUrl}${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`,
              {
                method: "GET",
                headers: {
                  Origin: window.location.origin,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
              }
            );

            if (proxyResponse.ok) {
              data = await proxyResponse.json();
              console.log("Proxy approach successful for review stats");
              // Store the raw response for debugging
              setRawApiResponse(data);
            } else {
              throw new Error("Proxy approach failed");
            }
          } catch (proxyError) {
            console.log("Proxy approach failed:", proxyError.message);

            try {
              // Approach 2: Try with axios
              console.log("Trying with axios for review stats...");
              const axiosResponse = await axios.get(
                `${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`
              );

              if (axiosResponse.status === 200) {
                data = axiosResponse.data;
                console.log("Axios approach successful for review stats");
                // Store the raw response for debugging
                setRawApiResponse(data);
              } else {
                throw new Error(
                  `Axios request failed with status ${axiosResponse.status}`
                );
              }
            } catch (axiosError) {
              console.log("Axios approach failed:", axiosError.message);

              // Approach 3: Try with no-cors mode as last resort
              console.log("Trying with no-cors mode for review stats...");

              try {
                // This will result in an opaque response that we can't read
                await fetch(
                  `${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`,
                  {
                    method: "GET",
                    mode: "no-cors",
                  }
                );

                // Since we can't read the response with no-cors,
                // we'll use mock data for demonstration purposes
                console.log("no-cors request completed, using mock data");

                // Create mock data that resembles the expected API response
                throw new Error("CORS_BLOCKED");
              } catch (noCorsError) {
                console.log("no-cors approach failed:", noCorsError.message);
                throw new Error("CORS_BLOCKED");
              }
            }
          }
        }
      } else {
        // Native platforms don't have CORS issues
        console.log(
          "Running on native platform, using standard fetch for review stats"
        );
        const response = await fetch(
          `${API_URL}/get_review_stats?hotel_name=${encodedHotelName}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `API request failed with status ${response.status}: ${errorText}`
          );
        }

        data = await response.json();
        // Store the raw response for debugging
        setRawApiResponse(data);
      }

      console.log("Fetched review stats successfully:", data);

      // Ensure the data has the expected structure
      if (!data || !data.counts) {
        throw new Error("Invalid data format received from API");
      }

      setReviewStats(data);
    } catch (error) {
      console.error("Error fetching review stats:", error);

      // Set a user-friendly error message
      if (error.message === "CORS_BLOCKED") {
        setError(
          "Cannot connect to the server due to CORS restrictions. Please try using the mobile app instead."
        );
      } else if (
        error.message.includes("CORS") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Failed to fetch")
      ) {
        setError(
          "Network error: Cannot connect to the server. If you're on web, this might be due to CORS restrictions."
        );
      } else {
        setError(`Failed to load review statistics: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Create stats based on the API response
  const getStats = () => {
    if (!reviewStats) {
      return [
        {
          title: "Total Reviews",
          value: "0",
          icon: "message-circle",
          color: theme.primary,
        },
        {
          title: "Positive Reviews",
          value: "0",
          icon: "thumbs-up",
          color: "#10B981",
        },
        {
          title: "Neutral Reviews",
          value: "0",
          icon: "minus",
          color: "#F59E0B",
        },
        {
          title: "Negative Reviews",
          value: "0",
          icon: "thumbs-down",
          color: "#EF4444",
        },
      ];
    }

    const { counts } = reviewStats;
    const totalReviews = counts.positive + counts.neutral + counts.negative;
    const positivePercentage = Math.round(
      (counts.positive / totalReviews) * 100
    );
    const negativePercentage = Math.round(
      (counts.negative / totalReviews) * 100
    );
    const neutralPercentage = Math.round((counts.neutral / totalReviews) * 100);

    return [
      {
        title: "Total Reviews",
        value: totalReviews.toString(),
        icon: "message-circle",
        color: theme.primary,
      },
      {
        title: "Positive Reviews",
        value: `${counts.positive} (${positivePercentage}%)`,
        icon: "thumbs-up",
        color: "#10B981",
      },
      {
        title: "Neutral Reviews",
        value: `${counts.neutral} (${neutralPercentage}%)`,
        icon: "minus",
        color: "#F59E0B",
      },
      {
        title: "Negative Reviews",
        value: `${counts.negative} (${negativePercentage}%)`,
        icon: "thumbs-down",
        color: "#EF4444",
      },
    ];
  };

  const quickActions = [
    {
      id: "1",
      title: "View Reviews",
      icon: "message-square",
      color: "#F59E0B",
      onPress: () => navigation.navigate("issues"),
    },
    {
      id: "2",
      title: "Manage Hotel",
      icon: "settings",
      color: "#10B981",
      onPress: () => navigation.navigate("solutions"),
    },
  ];

  // Create chart data based on the API response
  const getBarChartData = () => {
    if (!reviewStats) {
      return {
        labels: ["Positive", "Neutral", "Negative"],
        datasets: [{ data: [0, 0, 0] }],
      };
    }

    return {
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [
            reviewStats.counts.positive,
            reviewStats.counts.neutral,
            reviewStats.counts.negative,
          ],
        },
      ],
    };
  };

  const getPieChartData = () => {
    if (!reviewStats) {
      return [
        {
          name: "Positive",
          population: 0,
          color: "#10B981",
          legendFontColor: theme.text,
          legendFontSize: 12,
        },
        {
          name: "Negative",
          population: 0,
          color: "#EF4444",
          legendFontColor: theme.text,
          legendFontSize: 12,
        },
        {
          name: "Neutral",
          population: 0,
          color: "#F59E0B",
          legendFontColor: theme.text,
          legendFontSize: 12,
        },
      ];
    }

    const { counts } = reviewStats;
    const total = counts.positive + counts.neutral + counts.negative;

    return [
      {
        name: "Positive",
        population: Math.round((counts.positive / total) * 100),
        color: "#10B981",
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: "Negative",
        population: Math.round((counts.negative / total) * 100),
        color: "#EF4444",
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
      {
        name: "Neutral",
        population: Math.round((counts.neutral / total) * 100),
        color: "#F59E0B",
        legendFontColor: theme.text,
        legendFontSize: 12,
      },
    ];
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 24,
    },
    hotelName: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.primary,
      marginBottom: 24,
    },
    statsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    cardContainer: {
      width: "48%",
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    blurContainer: {
      overflow: "hidden",
      borderRadius: 16,
    },
    statCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.text,
      marginTop: 24,
      marginBottom: 16,
    },
    quickActionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    quickActionButton: {
      width: (width - 56) / 3,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: isDark
        ? "rgba(99, 102, 241, 0.05)"
        : "rgba(99, 102, 241, 0.02)",
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionTitle: {
      fontSize: 14,
      color: theme.text,
      textAlign: "center",
    },
    chartContainer: {
      marginBottom: 24,
      borderRadius: 16,
      overflow: "hidden",
    },
    chartBlur: {
      overflow: "hidden",
      borderRadius: 16,
    },
    chartGradient: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chartHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
    },
    chartLegend: {
      flexDirection: "row",
      alignItems: "center",
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 16,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    chartsWrapper: {
      alignItems: "center",
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
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
    imageContainer: {
      marginTop: 20,
      alignItems: "center",
      width: "100%",
    },
    chartImage: {
      width: width - 80,
      height: 220,
      borderRadius: 16,
      marginVertical: 10,
    },
    sampleReviewsContainer: {
      marginTop: 24,
      marginBottom: 24,
    },
    reviewCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      ...(Platform.OS === "web"
        ? {
            width: "100%",
            maxWidth: "100%",
          }
        : {}),
    },
    reviewText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      ...(Platform.OS === "web"
        ? {
            // Ensure web displays full text without truncation
            whiteSpace: "normal",
            overflow: "visible",
          }
        : {}),
    },
    reviewTypeTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 12,
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
    corsInfoContainer: {
      backgroundColor: isDark
        ? "rgba(99, 102, 241, 0.1)"
        : "rgba(99, 102, 241, 0.05)",
      padding: 16,
      borderRadius: 12,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: theme.border,
      width: "100%",
    },
    corsInfoTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
      marginTop: 12,
    },
    corsInfoText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
    corsInfoList: {
      marginLeft: 8,
    },
    chartSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 8,
    },
    imageUrl: {
      fontSize: 10,
      color: theme.textSecondary,
      textAlign: "center",
      marginTop: 4,
      padding: 4,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)",
      borderRadius: 4,
    },
    chartFallbackContainer: {
      marginVertical: 10,
      alignItems: "center",
      width: width - 80,
    },
    headerButtons: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconButton: {
      padding: 8,
      marginLeft: 8,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
      gap: 12,
    },
    mockDataBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      padding: 12,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    mockDataText: {
      color: "#F59E0B",
      fontSize: 14,
      fontWeight: "500",
    },
    debugContainer: {
      marginTop: 24,
      padding: 16,
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
      borderRadius: 12,
    },
    debugTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    debugSubtitle: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    debugScrollView: {
      maxHeight: 300,
      backgroundColor: isDark
        ? "rgba(0, 0, 0, 0.5)"
        : "rgba(255, 255, 255, 0.5)",
      borderRadius: 8,
      padding: 8,
    },
    debugText: {
      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
      fontSize: 12,
      color: isDark ? "#A3E635" : "#1E293B",
    },
  });

  const renderQuickAction = (action) => (
    <TouchableOpacity key={action.id} onPress={action.onPress}>
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.quickActionButton, { width: (width - 40) / 2 }]}
      >
        <Feather
          name={action.icon}
          size={24}
          color={action.color}
          style={styles.quickActionIcon}
        />
        <Text style={styles.quickActionTitle}>{action.title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderSentimentAnalysis = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.text, marginTop: 16 }}>
            Loading review statistics...
          </Text>
        </View>
      );
    }

    if (error) {
      const isCorsError = error.includes("CORS");

      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>

          {isCorsError && (
            <View style={styles.corsInfoContainer}>
              <Text style={styles.corsInfoTitle}>What is CORS?</Text>
              <Text style={styles.corsInfoText}>
                CORS (Cross-Origin Resource Sharing) is a security feature that
                prevents web pages from making requests to a different domain
                than the one that served the web page.
              </Text>

              <Text style={styles.corsInfoTitle}>How to fix it:</Text>
              <View style={styles.corsInfoList}>
                <Text style={styles.corsInfoText}>
                  1. Use the mobile app instead (no CORS restrictions)
                </Text>
                <Text style={styles.corsInfoText}>
                  2. Ask your server administrator to add CORS headers
                </Text>
                <Text style={styles.corsInfoText}>
                  3. Use a browser extension like "CORS Unblock" (for
                  development only)
                </Text>
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={() => {
                console.log(
                  "Refresh button clicked, fetching data for:",
                  hotelName
                );
                fetchReviewStats(hotelName);
              }}
            >
              <Feather name="refresh-cw" size={16} color={theme.primary} />
              <Text style={styles.refreshButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // If no review stats yet, show a placeholder
    if (!reviewStats) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{ color: theme.text }}>No review data available.</Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.sectionTitle}>Sentiment Analysis</Text>
        {usingMockData && (
          <View style={styles.mockDataBanner}>
            <Feather name="info" size={16} color="#F59E0B" />
            <Text style={styles.mockDataText}>
              Using test data for demonstration purposes
            </Text>
          </View>
        )}
        <View style={styles.chartContainer}>
          <BlurView
            intensity={isDark ? 20 : 60}
            tint={isDark ? "dark" : "light"}
            style={styles.chartBlur}
          >
            <LinearGradient
              colors={[
                isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
                isDark
                  ? "rgba(99, 102, 241, 0.05)"
                  : "rgba(99, 102, 241, 0.02)",
              ]}
              style={styles.chartGradient}
            >
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Review Distribution</Text>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#10B981" }]}
                    />
                    <Text style={styles.legendText}>Positive</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: "#EF4444" }]}
                    />
                    <Text style={styles.legendText}>Negative</Text>
                  </View>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartsWrapper}>
                  {reviewStats &&
                  reviewStats.bar_plot &&
                  !reviewStats.bar_plot_error ? (
                    <View style={styles.imageContainer}>
                      <Text style={styles.chartSubtitle}>Bar Chart</Text>
                      <Image
                        source={{ uri: reviewStats.bar_plot }}
                        style={styles.chartImage}
                        resizeMode="contain"
                        onError={(e) => {
                          console.log(
                            "Bar chart image loading error:",
                            e.nativeEvent.error
                          );
                          // Set a flag in state to show fallback chart
                          setReviewStats((prev) => ({
                            ...prev,
                            bar_plot_error: true,
                          }));
                        }}
                      />
                      {Platform.OS === "web" && (
                        <Text style={styles.imageUrl}>
                          Image URL: {reviewStats.bar_plot}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.chartFallbackContainer}>
                      <Text style={styles.chartSubtitle}>
                        Bar Chart (Generated)
                      </Text>
                      <BarChart
                        data={getBarChartData()}
                        width={width - 80}
                        height={220}
                        chartConfig={chartConfig}
                        style={styles.chart}
                        showValuesOnTopOfBars
                      />
                      {reviewStats && reviewStats.bar_plot_error && (
                        <Text style={styles.errorText}>
                          External chart image failed to load. Using generated
                          chart instead.
                        </Text>
                      )}
                    </View>
                  )}

                  {reviewStats &&
                  reviewStats.pie_chart &&
                  !reviewStats.pie_chart_error ? (
                    <View style={styles.imageContainer}>
                      <Text style={styles.chartSubtitle}>Pie Chart</Text>
                      <Image
                        source={{ uri: reviewStats.pie_chart }}
                        style={styles.chartImage}
                        resizeMode="contain"
                        onError={(e) => {
                          console.log(
                            "Pie chart image loading error:",
                            e.nativeEvent.error
                          );
                          // Set a flag in state to show fallback chart
                          setReviewStats((prev) => ({
                            ...prev,
                            pie_chart_error: true,
                          }));
                        }}
                      />
                      {Platform.OS === "web" && (
                        <Text style={styles.imageUrl}>
                          Image URL: {reviewStats.pie_chart}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.chartFallbackContainer}>
                      <Text style={styles.chartSubtitle}>
                        Pie Chart (Generated)
                      </Text>
                      <PieChart
                        data={getPieChartData()}
                        width={width - 80}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                      {reviewStats && reviewStats.pie_chart_error && (
                        <Text style={styles.errorText}>
                          External chart image failed to load. Using generated
                          chart instead.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </ScrollView>
            </LinearGradient>
          </BlurView>
        </View>
      </>
    );
  };

  const renderSampleReviews = () => {
    if (!reviewStats || !reviewStats.sample_reviews) return null;

    // Log review lengths to debug truncation issues
    if (Platform.OS === "web") {
      console.log(
        "Positive review length:",
        reviewStats.sample_reviews.positive[0]?.length
      );
      console.log(
        "Negative review length:",
        reviewStats.sample_reviews.negative[0]?.length
      );
    }

    return (
      <View style={styles.sampleReviewsContainer}>
        <Text style={styles.sectionTitle}>Sample Reviews</Text>

        <Text style={[styles.reviewTypeTitle, { color: "#10B981" }]}>
          Positive Reviews
        </Text>
        {reviewStats.sample_reviews.positive.length > 1 ? (
          // Display the second positive review (index 1) if available
          <View
            key="positive-1"
            style={[
              styles.reviewCard,
              { borderLeftColor: "#10B981", borderLeftWidth: 4 },
            ]}
          >
            <Text style={styles.reviewText} numberOfLines={null}>
              {reviewStats.sample_reviews.positive[1]}
            </Text>
          </View>
        ) : (
          // Fallback to the first review if second is not available
          reviewStats.sample_reviews.positive
            .slice(0, 1)
            .map((review, index) => (
              <View
                key={`positive-${index}`}
                style={[
                  styles.reviewCard,
                  { borderLeftColor: "#10B981", borderLeftWidth: 4 },
                ]}
              >
                <Text style={styles.reviewText} numberOfLines={null}>
                  {review}
                </Text>
              </View>
            ))
        )}

        <Text
          style={[styles.reviewTypeTitle, { color: "#EF4444", marginTop: 16 }]}
        >
          Negative Reviews
        </Text>
        {reviewStats.sample_reviews.negative
          .slice(0, 1)
          .map((review, index) => (
            <View
              key={`negative-${index}`}
              style={[
                styles.reviewCard,
                { borderLeftColor: "#EF4444", borderLeftWidth: 4 },
              ]}
            >
              <Text style={styles.reviewText} numberOfLines={null}>
                {review}
              </Text>
            </View>
          ))}
      </View>
    );
  };

  // Add debug section to display raw API response
  const renderDebugSection = () => {
    if (!showDebugInfo) return null;

    return (
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Information</Text>
        <Text style={styles.debugSubtitle}>Raw API Response:</Text>
        <ScrollView style={styles.debugScrollView}>
          <Text style={styles.debugText}>
            {JSON.stringify(rawApiResponse, null, 2)}
          </Text>
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Hotel Dashboard</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              console.log(
                "Refresh button clicked, fetching data for:",
                hotelName
              );
              fetchReviewStats(hotelName);
            }}
          >
            <Feather name="refresh-cw" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>
      {hotelName && <Text style={styles.hotelName}>{hotelName}</Text>}

      {usingMockData && (
        <View style={styles.mockDataBanner}>
          <Feather name="info" size={16} color="#F59E0B" />
          <Text style={styles.mockDataText}>
            Using test data for demonstration purposes
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        {getStats().map((stat, index) => (
          <Animated.View
            key={stat.title}
            entering={FadeInDown.duration(400).delay(index * 100)}
            style={styles.cardContainer}
          >
            <BlurView
              intensity={isDark ? 20 : 60}
              tint={isDark ? "dark" : "light"}
              style={styles.blurContainer}
            >
              <LinearGradient
                colors={[
                  isDark
                    ? "rgba(99, 102, 241, 0.1)"
                    : "rgba(99, 102, 241, 0.05)",
                  isDark
                    ? "rgba(99, 102, 241, 0.05)"
                    : "rgba(99, 102, 241, 0.02)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  <Feather name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        ))}
      </View>

      {renderSentimentAnalysis()}
      {renderSampleReviews()}
      {renderDebugSection()}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        {quickActions.map(renderQuickAction)}
      </View>
    </ScrollView>
  );
}
