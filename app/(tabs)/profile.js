import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getTravelPlans, getUserDiaries } from "../../utils/mongodb";

export default function ProfileTab() {
  const { theme } = useTheme();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [diaries, setDiaries] = useState([]);
  const [loadingDiaries, setLoadingDiaries] = useState(false);
  const [showDiaries, setShowDiaries] = useState(false);

  useEffect(() => {
    // Load user data
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setUserEmail(email);

        // Use the part before @ in email as a name if no name is stored
        const name = await AsyncStorage.getItem("userName");
        if (name) {
          setUserName(name);
        } else {
          setUserName(email.split("@")[0]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error retrieving user data:", error);
      setLoading(false);
    }
  };

  const fetchUserPlans = async () => {
    setLoadingPlans(true);
    try {
      const userPlans = await getTravelPlans();
      if (userPlans && userPlans.plans) {
        setPlans(userPlans.plans);
      }
      setShowPlans(true);
    } catch (error) {
      console.error("Error fetching travel plans:", error);
      Alert.alert("Error", "Failed to load travel plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchUserDiaries = async () => {
    setLoadingDiaries(true);
    try {
      const userDiaries = await getUserDiaries();
      if (userDiaries && userDiaries.diaries) {
        setDiaries(userDiaries.diaries);
      }
      setShowDiaries(true);
    } catch (error) {
      console.error("Error fetching user diaries:", error);
      Alert.alert("Error", "Failed to load travel diaries");
    } finally {
      setLoadingDiaries(false);
    }
  };

  const handleNavigation = (route) => {
    router.push(`/(auth)/${route}`);
  };

  const handleLogout = async () => {
    try {
      // Clear the essential user data from AsyncStorage
      await AsyncStorage.removeItem("userEmail");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("userType");
      await AsyncStorage.removeItem("username");

      // Force navigation to login
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  // Function to render individual travel plan
  const renderPlanItem = ({ item }) => {
    // Extract hotel name and location
    const hotelName = item.hotel?.name || "Unnamed Hotel";
    const location = item.hotel?.district || "Unknown Location";

    // Calculate total cost
    const totalCost = item.costs?.total_cost || 0;

    // Get duration
    const duration = item.stay?.num_days || 1;
    const durationText = `${duration} ${duration === 1 ? "Day" : "Days"}`;

    // Get number of rooms
    const rooms = item.stay?.num_rooms || 1;

    return (
      <TouchableOpacity
        style={[styles.planItem, { backgroundColor: theme.cardAlt }]}
        onPress={() => router.push(`/(user)/planDetails?planId=${item._id}`)}
      >
        <View style={styles.planHeader}>
          <Text style={[styles.planTitle, { color: theme.text }]}>
            {hotelName}
          </Text>
          <Text style={[styles.planDate, { color: theme.textSecondary }]}>
            {durationText}
          </Text>
        </View>
        <Text style={[styles.planBudget, { color: theme.primary }]}>
          Budget: LKR {totalCost.toLocaleString()}
        </Text>
        <Text style={[styles.planLocation, { color: theme.textSecondary }]}>
          {location} • {rooms} {rooms === 1 ? "Room" : "Rooms"}
        </Text>
        <View style={styles.viewDetailsContainer}>
          <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
            View details
          </Text>
          <Feather name="arrow-right" size={14} color={theme.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  // Function to render individual diary entry
  const renderDiaryItem = ({ item, index }) => {
    // Extract the first location from images if available
    const firstLocation =
      item.images && item.images.length > 0
        ? item.images[0].location
        : "Unknown Location";

    // Extract the first date from images if available
    const firstDate =
      item.images && item.images.length > 0
        ? item.images[0].date
        : new Date(item.created_at).toLocaleDateString();

    // Get the first few words of content for preview
    const contentPreview =
      item.content
        .replace(/\*\*/g, "") // Remove markdown formatting
        .split(" ")
        .slice(0, 15)
        .join(" ") + "...";

    return (
      <TouchableOpacity
        style={[styles.diaryItem, { backgroundColor: theme.cardAlt }]}
        onPress={() => router.push(`/(user)/diaryDetails?diaryId=${item._id}`)}
      >
        <View style={styles.diaryHeader}>
          <Text style={[styles.diaryTitle, { color: theme.text }]}>
            {firstLocation}
          </Text>
          <Text style={[styles.diaryDate, { color: theme.textSecondary }]}>
            {firstDate}
          </Text>
        </View>
        <Text style={[styles.diaryPreview, { color: theme.textSecondary }]}>
          {contentPreview}
        </Text>
        <View style={styles.diaryImageCountContainer}>
          <Feather name="image" size={14} color={theme.primary} />
          <Text style={[styles.diaryImageCount, { color: theme.primary }]}>
            {item.images ? item.images.length : 0} photos
          </Text>
        </View>
        <View style={styles.viewDetailsContainer}>
          <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
            View diary
          </Text>
          <Feather name="arrow-right" size={14} color={theme.primary} />
        </View>
      </TouchableOpacity>
    );
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
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerContent}>
          <View
            style={[styles.avatar, { backgroundColor: theme.primary + "20" }]}
          >
            <Feather name="user" size={40} color={theme.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {userName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {userEmail}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Feather name="user" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Your Profile
            </Text>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (!showDiaries) {
                fetchUserDiaries();
              } else {
                setShowDiaries(!showDiaries);
              }
            }}
          >
            <Feather name="book" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Travel Diaries
            </Text>
            <Feather
              name={showDiaries ? "chevron-down" : "chevron-right"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {loadingDiaries && (
            <View style={styles.plansLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.plansLoadingText, { color: theme.text }]}>
                Loading your travel diaries...
              </Text>
            </View>
          )}

          {showDiaries && !loadingDiaries && (
            <View style={styles.diariesContainer}>
              {diaries && diaries.length > 0 ? (
                <FlatList
                  data={diaries}
                  renderItem={renderDiaryItem}
                  keyExtractor={(item) => `diary-${item._id}`}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.noPlansContainer}>
                  <Feather name="info" size={20} color={theme.textSecondary} />
                  <Text
                    style={[styles.noPlansText, { color: theme.textSecondary }]}
                  >
                    No travel diaries found
                  </Text>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              if (!showPlans) {
                fetchUserPlans();
              } else {
                setShowPlans(!showPlans);
              }
            }}
          >
            <Feather name="map" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Travel Plans
            </Text>
            <Feather
              name={showPlans ? "chevron-down" : "chevron-right"}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          {loadingPlans && (
            <View style={styles.plansLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.plansLoadingText, { color: theme.text }]}>
                Loading your travel plans...
              </Text>
            </View>
          )}

          {showPlans && !loadingPlans && (
            <View style={styles.plansContainer}>
              {plans && plans.length > 0 ? (
                <FlatList
                  data={plans}
                  renderItem={renderPlanItem}
                  keyExtractor={(item) => `plan-${item._id}`}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.noPlansContainer}>
                  <Feather name="info" size={20} color={theme.textSecondary} />
                  <Text
                    style={[styles.noPlansText, { color: theme.textSecondary }]}
                  >
                    No travel plans found
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.createPlanButton,
                      { backgroundColor: theme.primary + "20" },
                    ]}
                    onPress={() => router.push("/(tabs)/budget")}
                  >
                    <Text
                      style={[styles.createPlanText, { color: theme.primary }]}
                    >
                      Create a Plan
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="settings" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Settings
            </Text>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Help & Support
          </Text>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="help-circle" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>FAQs</Text>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="message-circle" size={20} color={theme.primary} />
            <Text style={[styles.menuText, { color: theme.text }]}>
              Contact Us
            </Text>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.error }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: theme.textSecondary }]}>
          Version 1.0.0
        </Text>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  versionText: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: 32,
  },
  plansContainer: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  diariesContainer: {
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  plansLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  plansLoadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  planItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  planDate: {
    fontSize: 12,
  },
  planBudget: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  planLocation: {
    fontSize: 14,
  },
  noPlansContainer: {
    alignItems: "center",
    padding: 16,
  },
  noPlansText: {
    marginVertical: 8,
    fontSize: 14,
  },
  createPlanButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  createPlanText: {
    fontSize: 14,
    fontWeight: "500",
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  diaryItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  diaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  diaryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  diaryDate: {
    fontSize: 12,
  },
  diaryPreview: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  diaryImageCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  diaryImageCount: {
    fontSize: 12,
    marginLeft: 4,
  },
});
