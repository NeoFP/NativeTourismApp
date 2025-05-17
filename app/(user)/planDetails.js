import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { getTravelPlans } from "../../utils/mongodb";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function PlanDetails() {
  const { planId } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await getTravelPlans();

      if (response && response.plans) {
        const foundPlan = response.plans.find((p) => p._id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          setError("Travel plan not found");
        }
      } else {
        setError("Failed to fetch travel plan details");
      }
    } catch (err) {
      console.error("Error fetching travel plan details:", err);
      setError("An error occurred while fetching travel plan details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading travel plan...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="file-minus" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Travel plan not found
          </Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.backButtonSmall, { backgroundColor: theme.card }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>

        {/* Hotel Information */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={[theme.primary, theme.primary + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeader}
          >
            <Text style={styles.cardHeaderText}>Hotel Information</Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            <Text style={[styles.hotelName, { color: theme.text }]}>
              {plan.hotel.name}
            </Text>
            <Text style={[styles.hotelType, { color: theme.textSecondary }]}>
              {plan.hotel.type}
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Feather name="map-pin" size={16} color={theme.primary} />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  {plan.hotel.district}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Feather name="navigation" size={16} color={theme.primary} />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  {plan.hotel.distance.toFixed(1)} km away
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stay Details */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={[theme.primary, theme.primary + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeader}
          >
            <Text style={styles.cardHeaderText}>Stay Details</Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            <View style={styles.stayDetailsGrid}>
              <View style={styles.stayDetailItem}>
                <Feather name="calendar" size={20} color={theme.primary} />
                <Text style={[styles.stayDetailValue, { color: theme.text }]}>
                  {plan.stay.num_days}
                </Text>
                <Text
                  style={[
                    styles.stayDetailLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Days
                </Text>
              </View>

              <View style={styles.stayDetailItem}>
                <Feather name="home" size={20} color={theme.primary} />
                <Text style={[styles.stayDetailValue, { color: theme.text }]}>
                  {plan.stay.num_rooms}
                </Text>
                <Text
                  style={[
                    styles.stayDetailLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  Rooms
                </Text>
              </View>

              <View style={styles.stayDetailItem}>
                <Feather name="users" size={20} color={theme.primary} />
                <Text style={[styles.stayDetailValue, { color: theme.text }]}>
                  {plan.stay.total_people || plan.stay.num_rooms * 2}
                </Text>
                <Text
                  style={[
                    styles.stayDetailLabel,
                    { color: theme.textSecondary },
                  ]}
                >
                  People
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Cost Breakdown */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={[theme.primary, theme.primary + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeader}
          >
            <Text style={styles.cardHeaderText}>Cost Breakdown</Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
                Accommodation
              </Text>
              <Text style={[styles.costValue, { color: theme.text }]}>
                LKR {plan.costs.accommodation_cost.toLocaleString()}
              </Text>
            </View>

            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
                Food
              </Text>
              <Text style={[styles.costValue, { color: theme.text }]}>
                LKR {plan.costs.food_cost.toLocaleString()}
              </Text>
            </View>

            <View style={styles.costItem}>
              <Text style={[styles.costLabel, { color: theme.textSecondary }]}>
                Travel
              </Text>
              <Text style={[styles.costValue, { color: theme.text }]}>
                LKR {plan.costs.travel_cost.toLocaleString()}
              </Text>
            </View>

            <View style={[styles.costItem, styles.totalCostItem]}>
              <Text style={[styles.totalCostLabel, { color: theme.text }]}>
                Total Cost
              </Text>
              <Text style={[styles.totalCostValue, { color: theme.primary }]}>
                LKR {plan.costs.total_cost.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={[theme.primary, theme.primary + "80"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeader}
          >
            <Text style={styles.cardHeaderText}>Recommendations</Text>
          </LinearGradient>

          <View style={styles.cardContent}>
            {plan.recommendations && plan.recommendations.length > 0 ? (
              plan.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Feather
                    name="check-circle"
                    size={16}
                    color={theme.primary}
                  />
                  <Text
                    style={[styles.recommendationText, { color: theme.text }]}
                  >
                    {recommendation}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={[
                  styles.noRecommendationsText,
                  { color: theme.textSecondary },
                ]}
              >
                No recommendations available
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 60,
  },
  backButtonSmall: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cardHeaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cardContent: {
    padding: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  hotelType: {
    fontSize: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  stayDetailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  stayDetailItem: {
    alignItems: "center",
    padding: 8,
  },
  stayDetailValue: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 8,
  },
  stayDetailLabel: {
    fontSize: 14,
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  costLabel: {
    fontSize: 16,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalCostItem: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  noRecommendationsText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
