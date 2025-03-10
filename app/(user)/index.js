import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useState, useEffect } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { reviewsData } from "./reviewsData";

export default function UserDashboard() {
  const { theme } = useTheme();
  const [randomReviews, setRandomReviews] = useState([]);

  useEffect(() => {
    // Get random reviews
    const shuffled = [...reviewsData]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(reviewsData.length, 100));
    setRandomReviews(shuffled);
  }, []);

  const ReviewCard = ({ review }) => (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[
        styles.reviewCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.reviewHeader}>
        <Feather name="map-pin" size={16} color={theme.primary} />
        <Text style={[styles.locationName, { color: theme.text }]}>
          {review.Location_Name}
        </Text>
      </View>
      <Text style={[styles.reviewText, { color: theme.textSecondary }]}>
        {review["reviews.text"]}
      </Text>
      <View style={styles.reviewFooter}>
        <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
          {review.Published_Date}
        </Text>
        <Text style={[styles.locationType, { color: theme.primary }]}>
          {review.Location_Type}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Tourism App
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Discover what travelers are saying!
        </Text>
      </View>

      <ScrollView
        style={styles.reviewsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reviewsContent}
      >
        {randomReviews.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  reviewsContainer: {
    flex: 1,
  },
  reviewsContent: {
    padding: 20,
    paddingTop: 0,
  },
  reviewCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  locationType: {
    fontSize: 12,
    fontWeight: "600",
  },
});
