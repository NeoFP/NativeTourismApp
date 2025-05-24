import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import WriteReviewButton from "../components/WriteReviewButton";

export default function HomeTab() {
  const { theme } = useTheme();

  const handleNavigation = (route) => {
    router.push(`/(tabs)/${route}`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.primary + "20" },
          ]}
        >
          <Feather name="map-pin" size={40} color={theme.primary} />
        </View>
      </View>

      <Animated.View
        entering={FadeInDown.springify().delay(100)}
        style={[styles.card, { backgroundColor: theme.card }]}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Sri Lanka Tourism
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Discover the beauty of Sri Lanka
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.springify().delay(150)}
        style={styles.reviewButtonContainer}
      >
        <WriteReviewButton
          buttonText="Write a Review"
          style={{ marginHorizontal: 16 }}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.springify().delay(200)}
        style={styles.menuContainer}
      >
        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={() => handleNavigation("explore")}
        >
          <Feather name="compass" size={24} color={theme.primary} />
          <Text style={[styles.menuText, { color: theme.text }]}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={() => handleNavigation("budget")}
        >
          <Feather name="dollar-sign" size={24} color={theme.primary} />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Budget Planner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={() => handleNavigation("diary")}
        >
          <Feather name="book-open" size={24} color={theme.primary} />
          <Text style={[styles.menuText, { color: theme.text }]}>
            Travel Diary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: theme.card }]}
          onPress={() => handleNavigation("profile")}
        >
          <Feather name="user" size={24} color={theme.primary} />
          <Text style={[styles.menuText, { color: theme.text }]}>Profile</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.springify().delay(300)}
        style={[styles.infoCard, { backgroundColor: theme.card }]}
      >
        <Text style={[styles.infoTitle, { color: theme.text }]}>
          Travel Smart with Our Budget Planner
        </Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Create personalized travel plans based on your budget and preferences.
          Our AI-powered system will help you find the best hotels, activities,
          and transportation options.
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => handleNavigation("budget")}
        >
          <Text style={styles.buttonText}>Plan Your Trip</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  card: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  menuContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },
  menuItem: {
    width: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    marginTop: 8,
    fontWeight: "500",
  },
  infoCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  reviewButtonContainer: {
    marginBottom: 16,
  },
});
