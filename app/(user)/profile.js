import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { clearUserCredentials } from "../../utils/auth";
import { router } from "expo-router";

const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function Profile() {
  const { theme } = useTheme();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [travelPlans, setTravelPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch user data when component mounts
    getUserData();
    fetchTravelPlans();
  }, []);

  const getUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setUserEmail(email);

        // Try to get the user's name (if stored)
        const name = await AsyncStorage.getItem("userName");
        if (name) {
          setUserName(name);
        } else {
          // Use the part before @ in email as a name
          setUserName(email.split("@")[0]);
        }

        // Try to get profile image if saved
        const savedImage = await AsyncStorage.getItem("profileImage");
        if (savedImage) {
          setProfileImage(savedImage);
        }
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    }
  };

  const fetchTravelPlans = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem("userEmail");

      if (!email) {
        Alert.alert("Error", "You need to be logged in to view your profile");
        router.replace("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/get_user_plans?_id=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Travel plans data:", data);

      if (data && Array.isArray(data)) {
        setTravelPlans(data);
      } else if (data && data.plans && Array.isArray(data.plans)) {
        setTravelPlans(data.plans);
      } else {
        console.log("No travel plans found or unexpected data format");
        setTravelPlans([]);
      }
    } catch (error) {
      console.error("Error fetching travel plans:", error);
      Alert.alert(
        "Error",
        "Failed to load your travel plans. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTravelPlans();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);
        await AsyncStorage.setItem("profileImage", selectedImage);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to set profile image");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await clearUserCredentials();
            router.replace("/login");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to log out");
          }
        },
      },
    ]);
  };

  const renderTravelPlanItem = (planData, index) => {
    // Extract plans from the planData
    const plans = planData.plans || [];

    if (plans.length === 0) {
      return null;
    }

    // Get the date from the plan data
    const planDate = planData.created_at
      ? new Date(
          planData.created_at.$date || planData.created_at
        ).toLocaleDateString()
      : "Unknown date";

    return (
      <Animated.View
        key={index}
        entering={FadeIn.delay(index * 200)}
        style={[
          styles.planCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.text,
          },
        ]}
      >
        <View style={styles.planCardHeader}>
          <Text style={[styles.planCardDate, { color: theme.text }]}>
            {planDate}
          </Text>
          <Text style={[styles.planCardCount, { color: theme.textSecondary }]}>
            {plans.length} options
          </Text>
        </View>

        {/* Just show the first plan as a preview */}
        {plans.length > 0 && (
          <View style={styles.planPreview}>
            <Text style={[styles.hotelName, { color: theme.text }]}>
              {plans[0].hotel.name}
            </Text>

            <Text
              style={[styles.hotelLocation, { color: theme.textSecondary }]}
            >
              {plans[0].hotel.district}
            </Text>

            <View style={styles.planStats}>
              <View style={styles.statItem}>
                <Feather name="users" size={14} color={theme.primary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                  {plans[0].stay.num_rooms} Rooms
                </Text>
              </View>

              <View style={styles.statItem}>
                <Feather name="calendar" size={14} color={theme.primary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                  {plans[0].stay.num_days} Days
                </Text>
              </View>

              <View style={styles.statItem}>
                <Feather name="dollar-sign" size={14} color={theme.primary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                  LKR {plans[0].costs.total_cost.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.moreOptionsRow}>
              {plans.length > 1 && (
                <Text
                  style={[
                    styles.moreOptionsText,
                    { color: theme.textSecondary },
                  ]}
                >
                  +{plans.length - 1} more options
                </Text>
              )}

              <TouchableOpacity
                style={[
                  styles.viewButton,
                  { backgroundColor: theme.primary + "20" },
                ]}
                onPress={() =>
                  Alert.alert(
                    "Plan Details",
                    `Accommodation: LKR ${plans[0].costs.accommodation_cost.toLocaleString()}\nFood: LKR ${plans[0].costs.food_cost.toLocaleString()}\nTravel: LKR ${plans[0].costs.travel_cost.toLocaleString()}\n\nTotal: LKR ${plans[0].costs.total_cost.toLocaleString()}`
                  )
                }
              >
                <Text style={[styles.viewButtonText, { color: theme.primary }]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={[styles.profileHeader, { backgroundColor: theme.card }]}
        >
          <TouchableOpacity
            onPress={pickImage}
            style={styles.profileImageContainer}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View
                style={[
                  styles.profileImagePlaceholder,
                  { backgroundColor: theme.primary + "30" },
                ]}
              >
                <Feather name="user" size={40} color={theme.primary} />
              </View>
            )}
            <View
              style={[
                styles.editIconContainer,
                { backgroundColor: theme.primary },
              ]}
            >
              <Feather name="edit-2" size={12} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: theme.text }]}>
            {userName}
          </Text>

          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {userEmail}
          </Text>

          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: theme.error }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={16} color={theme.error} />
            <Text style={[styles.logoutText, { color: theme.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.travelPlansSection}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Travel Plans
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={theme.primary}
              style={styles.loader}
            />
          ) : travelPlans.length > 0 ? (
            travelPlans.map((plan, index) => renderTravelPlanItem(plan, index))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Feather name="map" size={50} color={theme.textSecondary} />
              <Text
                style={[styles.emptyStateText, { color: theme.textSecondary }]}
              >
                You haven't created any travel plans yet
              </Text>
              <TouchableOpacity
                style={[
                  styles.createPlanButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={() => router.push("/budget")}
              >
                <Text style={styles.createPlanButtonText}>
                  Create Your First Plan
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  profileHeader: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  planCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden",
  },
  planCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  planCardDate: {
    fontWeight: "600",
  },
  planCardCount: {
    fontSize: 12,
  },
  planPreview: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    marginBottom: 16,
  },
  planStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  moreOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moreOptionsText: {
    fontSize: 14,
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  createPlanButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createPlanButtonText: {
    color: "white",
    fontWeight: "600",
  },
  loader: {
    marginTop: 32,
  },
  travelPlansSection: {
    marginBottom: 32,
  },
});
