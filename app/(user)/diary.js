import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getTravelPlans, getUserId } from "../../utils/mongodb";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function DiaryScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryContent, setDiaryContent] = useState("");
  const [diaries, setDiaries] = useState([]);
  const [loadingDiaries, setLoadingDiaries] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadTravelPlans();
    loadDiaries();
  }, []);

  const loadTravelPlans = async () => {
    setLoading(true);
    try {
      const userPlans = await getTravelPlans();
      if (userPlans && userPlans.plans) {
        setPlans(userPlans.plans);
      }
    } catch (error) {
      console.error("Error loading travel plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiaries = async () => {
    setLoadingDiaries(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error("User not logged in");
      }

      const response = await fetch(
        `${API_URL}/get_user_diaries?userId=${encodeURIComponent(userId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch diaries");
      }

      const data = await response.json();
      if (data && data.diaries) {
        setDiaries(data.diaries);
      }
    } catch (error) {
      console.error("Error fetching diaries:", error);
      // If endpoint doesn't exist yet, just use empty array
      setDiaries([]);
    } finally {
      setLoadingDiaries(false);
    }
  };

  const generateDiary = async () => {
    if (!selectedPlan) {
      Alert.alert("Error", "Please select a travel plan");
      return;
    }

    if (!diaryTitle.trim()) {
      Alert.alert("Error", "Please enter a title for your diary");
      return;
    }

    setGenerating(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error("User not logged in");
      }

      // Prepare travel plan data for AI
      const planData = {
        destination: selectedPlan.destination || "",
        duration: selectedPlan.duration || "",
        budget: selectedPlan.budget || "",
        location: selectedPlan.location ? selectedPlan.location.name : "",
        activities: selectedPlan.activities || [],
      };

      // For demonstration, create a template-based diary if API is not available
      let generatedDiary = `# ${diaryTitle}\n\n`;
      generatedDiary += `## My Trip to ${planData.destination}\n\n`;

      generatedDiary += `I had an amazing ${planData.duration} trip to ${planData.location}. `;
      generatedDiary += `With a budget of $${planData.budget}, I was able to experience the beauty and culture of this wonderful destination.\n\n`;

      if (planData.activities && planData.activities.length > 0) {
        generatedDiary += `## Activities I Enjoyed\n\n`;
        planData.activities.forEach((activity) => {
          generatedDiary += `- ${activity}\n`;
        });
        generatedDiary += "\n";
      }

      generatedDiary += `## Memorable Moments\n\n`;
      generatedDiary += `The people were friendly and the scenery was breathtaking. I'll never forget the moments I spent exploring the local culture and natural beauty of ${planData.destination}.\n\n`;

      generatedDiary += `## Would I Go Again?\n\n`;
      generatedDiary += `Absolutely! This trip was worth every penny and I can't wait to visit again someday.`;

      // If you have an AI endpoint, you would call it here instead
      // const response = await fetch(`${API_URL}/generate_diary`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     userId,
      //     title: diaryTitle,
      //     planData,
      //   }),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to generate diary");
      // }

      // const data = await response.json();
      // const generatedDiary = data.content;

      // Save the generated diary
      const newDiary = {
        id: Date.now().toString(),
        title: diaryTitle,
        content: generatedDiary,
        date: new Date().toISOString(),
        planId: plans.indexOf(selectedPlan),
      };

      // Add to local state
      const updatedDiaries = [newDiary, ...diaries];
      setDiaries(updatedDiaries);

      // Reset form
      setDiaryTitle("");
      setSelectedPlan(null);
      setDiaryContent("");
      setShowCreateForm(false);

      // Save to local storage for now (in a real app, you'd save to backend)
      try {
        await AsyncStorage.setItem(
          "userDiaries",
          JSON.stringify(updatedDiaries)
        );
      } catch (err) {
        console.error("Error saving to storage:", err);
      }

      Alert.alert("Success", "Your travel diary has been generated!");
    } catch (error) {
      console.error("Error generating diary:", error);
      Alert.alert("Error", "Failed to generate diary");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewDiary = (diary) => {
    router.push({
      pathname: "/(user)/diaryDetails",
      params: { diaryId: diary.id },
    });
  };

  const renderDiaryItem = (diary, index) => (
    <TouchableOpacity
      key={diary.id || index}
      style={[styles.diaryItem, { backgroundColor: theme.card }]}
      onPress={() => handleViewDiary(diary)}
    >
      <View style={styles.diaryHeader}>
        <Text style={[styles.diaryTitle, { color: theme.text }]}>
          {diary.title}
        </Text>
        <Text style={[styles.diaryDate, { color: theme.textSecondary }]}>
          {new Date(diary.date).toLocaleDateString()}
        </Text>
      </View>
      <Text
        style={[styles.diaryPreview, { color: theme.textSecondary }]}
        numberOfLines={2}
      >
        {diary.content.replace(/[#*]/g, "")}
      </Text>
      <View style={styles.viewDetailsContainer}>
        <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
          Read more
        </Text>
        <Feather name="arrow-right" size={14} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Travel Diaries
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Create and view your travel memories
          </Text>
        </View>

        <View style={styles.content}>
          {!showCreateForm ? (
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowCreateForm(true)}
            >
              <Feather name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create New Diary</Text>
            </TouchableOpacity>
          ) : (
            <View
              style={[styles.formContainer, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.formTitle, { color: theme.text }]}>
                Generate a Travel Diary
              </Text>

              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Diary Title
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Enter a title for your diary"
                placeholderTextColor={theme.textSecondary}
                value={diaryTitle}
                onChangeText={setDiaryTitle}
              />

              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Select Travel Plan
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.planSelector}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : plans.length > 0 ? (
                  plans.map((plan, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.planOption,
                        {
                          backgroundColor:
                            selectedPlan === plan
                              ? theme.primary
                              : theme.background,
                          borderColor: theme.border,
                        },
                      ]}
                      onPress={() => setSelectedPlan(plan)}
                    >
                      <Text
                        style={[
                          styles.planOptionText,
                          {
                            color:
                              selectedPlan === plan ? "#FFFFFF" : theme.text,
                          },
                        ]}
                      >
                        {plan.destination || `Trip ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noPlansMessage}>
                    <Text
                      style={[
                        styles.noPlansText,
                        { color: theme.textSecondary },
                      ]}
                    >
                      No travel plans found. Create a plan first.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={() => setShowCreateForm(false)}
                >
                  <Text
                    style={[styles.cancelButtonText, { color: theme.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    {
                      backgroundColor: theme.primary,
                      opacity: generating ? 0.7 : 1,
                    },
                  ]}
                  onPress={generateDiary}
                  disabled={generating}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather
                        name="book"
                        size={16}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.generateButtonText}>
                        Generate Diary
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.diariesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Diaries
            </Text>

            {loadingDiaries ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.text }]}>
                  Loading your diaries...
                </Text>
              </View>
            ) : diaries.length > 0 ? (
              <View style={styles.diariesList}>
                {diaries.map((diary, index) => renderDiaryItem(diary, index))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="book-open"
                  size={48}
                  color={theme.textSecondary}
                />
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: theme.textSecondary },
                  ]}
                >
                  You haven't created any diaries yet
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtext,
                    { color: theme.textSecondary },
                  ]}
                >
                  Generate your first diary to preserve your travel memories
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  formContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  planSelector: {
    flexDirection: "row",
    marginBottom: 20,
  },
  planOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  planOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  noPlansMessage: {
    padding: 12,
  },
  noPlansText: {
    fontSize: 14,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  generateButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  diariesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  diariesList: {
    marginTop: 8,
  },
  diaryItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    lineHeight: 20,
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
