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

  // Defensive checks for missing fields
  // If the plan has a 'plans' array (as in the budget result), use all of them
  const planOptions =
    Array.isArray(plan.plans) && plan.plans.length > 0 ? plan.plans : [plan];
  const createdAt = plan.created_at
    ? new Date(plan.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
      >
        <TouchableOpacity
          style={[styles.backButtonSmall, { backgroundColor: theme.card }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </TouchableOpacity>

        {planOptions.map((planData, idx) => {
          const hotel = planData.hotel || {};
          const stay = planData.stay || {};
          const costs = planData.costs || {};
          const recommendations = planData.recommendations || [];
          return (
            <View key={idx} style={{ marginBottom: 24 }}>
              {/* Option Header */}
              <View
                style={[
                  styles.optionHeader,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text style={styles.optionTitle}>Option {idx + 1}</Text>
              </View>

              {/* Hotel Information and Stats */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.hotelName, { color: theme.text }]}>
                    {hotel.name || "Unnamed Hotel"}
                  </Text>
                  <Text
                    style={[styles.hotelType, { color: theme.textSecondary }]}
                  >
                    {hotel.type || "Type N/A"} •{" "}
                    {hotel.district || "Unknown District"}
                  </Text>
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Feather name="users" size={16} color={theme.primary} />
                      <Text style={[styles.statText, { color: theme.text }]}>
                        {stay.num_rooms || 1}{" "}
                        {stay.num_rooms === 1 ? "Room" : "Rooms"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Feather
                        name="calendar"
                        size={16}
                        color={theme.primary}
                      />
                      <Text style={[styles.statText, { color: theme.text }]}>
                        {stay.num_days || 1}{" "}
                        {stay.num_days === 1 ? "Day" : "Days"}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Feather name="map-pin" size={16} color={theme.primary} />
                      <Text style={[styles.statText, { color: theme.text }]}>
                        {hotel.distance !== undefined
                          ? hotel.distance.toFixed(1)
                          : "-"}{" "}
                        km
                      </Text>
                    </View>
                  </View>
                  {createdAt && idx === 0 && (
                    <Text
                      style={[
                        styles.createdAt,
                        {
                          color: theme.textSecondary,
                          fontSize: 13,
                          marginTop: 8,
                        },
                      ]}
                    >
                      Created: {createdAt}
                    </Text>
                  )}
                </View>
              </View>

              {/* Cost Breakdown */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Cost Breakdown
                  </Text>
                  <View style={styles.costItem}>
                    <Text
                      style={[styles.costLabel, { color: theme.textSecondary }]}
                    >
                      Accommodation
                    </Text>
                    <Text style={[styles.costValue, { color: theme.text }]}>
                      LKR{" "}
                      {costs.accommodation_cost !== undefined
                        ? costs.accommodation_cost.toLocaleString()
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text
                      style={[styles.costLabel, { color: theme.textSecondary }]}
                    >
                      Food
                    </Text>
                    <Text style={[styles.costValue, { color: theme.text }]}>
                      LKR{" "}
                      {costs.food_cost !== undefined
                        ? costs.food_cost.toLocaleString()
                        : "-"}
                    </Text>
                  </View>
                  <View style={styles.costItem}>
                    <Text
                      style={[styles.costLabel, { color: theme.textSecondary }]}
                    >
                      Travel
                    </Text>
                    <Text style={[styles.costValue, { color: theme.text }]}>
                      LKR{" "}
                      {costs.travel_cost !== undefined
                        ? costs.travel_cost.toLocaleString()
                        : "-"}
                    </Text>
                  </View>
                  <View style={[styles.costItem, styles.totalCostItem]}>
                    <Text
                      style={[styles.totalCostLabel, { color: theme.text }]}
                    >
                      Total Cost
                    </Text>
                    <Text
                      style={[styles.totalCostValue, { color: theme.primary }]}
                    >
                      LKR{" "}
                      {costs.total_cost !== undefined
                        ? costs.total_cost.toLocaleString()
                        : "-"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Recommendations */}
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Recommendations
                  </Text>
                  {recommendations && recommendations.length > 0 ? (
                    recommendations.map((recommendation, i) => (
                      <View key={i} style={styles.recommendationItem}>
                        <Feather
                          name="check-circle"
                          size={16}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.recommendationText,
                            { color: theme.text },
                          ]}
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
            </View>
          );
        })}
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
  createdAt: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: "right",
  },
  optionHeader: {
    padding: 16,
    alignItems: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  optionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 14,
    marginLeft: 8,
  },
});
