import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const API_BASE_URL =
  "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";
const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

// Shuffle array function
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Explore() {
  const { theme } = useTheme();
  const [topPlaces, setTopPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch top places
      const topPlacesResponse = await fetch(`${API_BASE_URL}/top_places`);
      if (topPlacesResponse.ok) {
        const data = await topPlacesResponse.json();
        setTopPlaces(data.top_places || []);
      }

      // Fetch reviews, shuffle them, and take 10 random ones
      const reviewsResponse = await fetch(`${API_BASE_URL}/get_reviews`);
      if (reviewsResponse.ok) {
        const reviewData = await reviewsResponse.json();
        // Shuffle the reviews and take 10 random ones
        const shuffledReviews = shuffleArray(reviewData);
        setReviews(shuffledReviews.slice(0, 10) || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Format date from "Sat, 16 Jan 2021 00:00:00 GMT" to "Jan 16, 2021"
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          styles.loadingContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading amazing places...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headingText, { color: theme.text }]}>
          Explore Sri Lanka
        </Text>
        <Text style={[styles.subHeadingText, { color: theme.textSecondary }]}>
          Discover the most amazing places and experiences
        </Text>
      </View>

      {/* Top Places Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Top Places
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            Places with the highest positive reviews
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topPlacesContainer}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 16}
          snapToAlignment="start"
        >
          {topPlaces.map((place, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.placeCard, { backgroundColor: theme.card }]}
              onPress={() => {
                // Navigate to place details in the future
              }}
              activeOpacity={0.9}
            >
              <View style={styles.placeCardContent}>
                <View style={styles.placeNameRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Text
                    style={[styles.placeName, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {place.name}
                  </Text>
                </View>

                <View style={styles.placeStats}>
                  <View style={styles.ratingRow}>
                    <View
                      style={[
                        styles.ratingBadge,
                        {
                          backgroundColor:
                            place.positive_percentage >= 95
                              ? "#4CAF50"
                              : place.positive_percentage >= 90
                              ? "#8BC34A"
                              : place.positive_percentage >= 85
                              ? "#FFC107"
                              : "#F44336",
                        },
                      ]}
                    >
                      <Text style={styles.ratingText}>
                        {Math.round(place.positive_percentage)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewRow}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color={theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.reviewCount,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {place.total_reviews}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Reviews
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            What people are saying about Sri Lanka
          </Text>
        </View>

        {reviews.map((review, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.reviewCard, { backgroundColor: theme.card }]}
            activeOpacity={0.9}
          >
            <View style={styles.reviewHeader}>
              <View style={styles.reviewTitleContainer}>
                <Text style={[styles.reviewTitle, { color: theme.text }]}>
                  {review.Location_Name}
                </Text>
                <Text
                  style={[styles.reviewDate, { color: theme.textSecondary }]}
                >
                  {formatDate(review.Published_Date)}
                </Text>
              </View>
              <View
                style={[
                  styles.reviewIconBadge,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={theme.primary}
                />
              </View>
            </View>

            <Text
              style={[styles.reviewText, { color: theme.text }]}
              numberOfLines={3}
            >
              {review.text}
            </Text>

            <View style={styles.reviewFooter}>
              <TouchableOpacity
                style={[
                  styles.readMoreButton,
                  { backgroundColor: theme.primary + "15" },
                ]}
              >
                <Text style={[styles.readMoreText, { color: theme.primary }]}>
                  Read more
                </Text>
                <Feather name="chevron-right" size={14} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.viewAllButton,
            { backgroundColor: theme.primary + "10" },
          ]}
        >
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            View all reviews
          </Text>
          <Feather name="arrow-right" size={16} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headingText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subHeadingText: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  topPlacesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  placeCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  placeCardContent: {
    padding: 16,
  },
  placeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    lineHeight: 22,
  },
  placeStats: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  ratingRow: {
    marginBottom: 8,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCount: {
    fontSize: 13,
    marginLeft: 6,
  },
  reviewCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  reviewTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  reviewIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: "500",
    marginRight: 4,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
  },
});
