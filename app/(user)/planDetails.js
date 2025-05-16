import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getTravelPlans } from "../../utils/mongodb";

export default function PlanDetails() {
  const { theme } = useTheme();
  const { planId } = useLocalSearchParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await getTravelPlans();

      if (response && response.plans && response.plans.length > 0) {
        // Find the plan with the matching ID
        const selectedPlan = response.plans.find(
          (p, index) => index.toString() === planId
        );

        if (selectedPlan) {
          setPlan(selectedPlan);
        } else {
          console.error("Plan not found with ID:", planId);
        }
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading plan details...
        </Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <Feather name="alert-circle" size={48} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.text }]}>
          Plan not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: "#FFFFFF" }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {plan.destination || "Travel Plan"}
        </Text>

        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {plan.duration || "Duration not specified"}
        </Text>
      </View>

      <View style={styles.content}>
        {plan.location && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              <Feather
                name="map-pin"
                size={18}
                color={theme.primary}
                style={styles.sectionIcon}
              />
              Location
            </Text>
            <Text style={[styles.locationName, { color: theme.text }]}>
              {plan.location.name}
            </Text>
            {plan.location.description && (
              <Text
                style={[
                  styles.locationDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {plan.location.description}
              </Text>
            )}
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            <Feather
              name="dollar-sign"
              size={18}
              color={theme.primary}
              style={styles.sectionIcon}
            />
            Budget
          </Text>
          <Text style={[styles.budgetAmount, { color: theme.primary }]}>
            ${plan.budget || "Not specified"}
          </Text>
        </View>

        {plan.activities && plan.activities.length > 0 && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              <Feather
                name="calendar"
                size={18}
                color={theme.primary}
                style={styles.sectionIcon}
              />
              Activities
            </Text>
            {plan.activities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityBullet,
                    { backgroundColor: theme.primary },
                  ]}
                />
                <Text style={[styles.activityText, { color: theme.text }]}>
                  {activity}
                </Text>
              </View>
            ))}
          </View>
        )}

        {plan.accommodations && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              <Feather
                name="home"
                size={18}
                color={theme.primary}
                style={styles.sectionIcon}
              />
              Accommodations
            </Text>
            <Text style={[styles.accommodationsText, { color: theme.text }]}>
              {plan.accommodations}
            </Text>
          </View>
        )}

        {plan.transportation && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              <Feather
                name="truck"
                size={18}
                color={theme.primary}
                style={styles.sectionIcon}
              />
              Transportation
            </Text>
            <Text style={[styles.transportationText, { color: theme.text }]}>
              {plan.transportation}
            </Text>
          </View>
        )}

        {plan.notes && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              <Feather
                name="file-text"
                size={18}
                color={theme.primary}
                style={styles.sectionIcon}
              />
              Notes
            </Text>
            <Text style={[styles.notesText, { color: theme.text }]}>
              {plan.notes}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  backIcon: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  locationDescription: {
    fontSize: 14,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  activityText: {
    fontSize: 16,
  },
  accommodationsText: {
    fontSize: 16,
  },
  transportationText: {
    fontSize: 16,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
