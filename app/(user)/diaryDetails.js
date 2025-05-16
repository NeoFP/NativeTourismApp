import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Image,
  FlatList,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DiaryDetails() {
  const { theme } = useTheme();
  const { diaryId } = useLocalSearchParams();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiaryDetails();
  }, [diaryId]);

  const loadDiaryDetails = async () => {
    try {
      setLoading(true);
      // Try to load from backend first (in a real app)
      // const response = await fetch(`${API_URL}/get_diary_details?diaryId=${diaryId}`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setDiary(data.diary);
      // }

      // As a fallback, load from local storage
      const storedDiaries = await AsyncStorage.getItem("userDiaries");
      if (storedDiaries) {
        const diaries = JSON.parse(storedDiaries);
        const selectedDiary = diaries.find((d) => d.id === diaryId);
        if (selectedDiary) {
          setDiary(selectedDiary);
        }
      }
    } catch (error) {
      console.error("Error loading diary details:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareDiary = async () => {
    if (!diary) return;

    try {
      // Strip markdown for better sharing
      const plainContent = diary.content.replace(/[#*]/g, "");

      await Share.share({
        title: diary.title,
        message: `${diary.title}\n\n${plainContent}`,
      });
    } catch (error) {
      console.error("Error sharing diary:", error);
    }
  };

  // Render images from the diary
  const renderImages = () => {
    if (!diary || !diary.images || diary.images.length === 0) {
      return null;
    }

    return (
      <View style={styles.imagesSection}>
        <Text style={[styles.imagesTitle, { color: theme.text }]}>
          Trip Photos
        </Text>
        <FlatList
          horizontal
          data={diary.images}
          keyExtractor={(item, index) => `image-${index}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri: `https://tourismaiapp2025.s3.amazonaws.com/${item.image_path}`,
                }}
                style={styles.diaryImage}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.imageInfo,
                  { backgroundColor: theme.primary + "80" },
                ]}
              >
                <Text style={styles.imageLocation}>{item.location}</Text>
                <Text style={styles.imageDate}>{item.date}</Text>
              </View>
            </View>
          )}
        />
      </View>
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
          Loading diary...
        </Text>
      </View>
    );
  }

  if (!diary) {
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
          Diary not found
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareIcon} onPress={shareDiary}>
          <Feather name="share-2" size={22} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {diary.title}
          </Text>
          <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
            {new Date(diary.date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.content}
      >
        {/* Display images if present */}
        {renderImages()}

        <View
          style={[styles.markdownContainer, { backgroundColor: theme.card }]}
        >
          <Markdown
            style={{
              body: { color: theme.text, fontSize: 16, lineHeight: 24 },
              heading1: {
                color: theme.primary,
                fontSize: 24,
                fontWeight: "bold",
                marginVertical: 12,
              },
              heading2: {
                color: theme.primary,
                fontSize: 20,
                fontWeight: "bold",
                marginVertical: 10,
              },
              heading3: {
                color: theme.text,
                fontSize: 18,
                fontWeight: "bold",
                marginVertical: 8,
              },
              paragraph: {
                marginVertical: 8,
                color: theme.text,
              },
              list_item: {
                marginVertical: 4,
                color: theme.text,
              },
              bullet_list: {
                marginVertical: 8,
              },
              blockquote: {
                backgroundColor: theme.background,
                borderLeftColor: theme.primary,
                borderLeftWidth: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginVertical: 8,
              },
              hr: {
                backgroundColor: theme.border,
                height: 1,
                marginVertical: 16,
              },
              strong: { fontWeight: "bold" },
              em: { fontStyle: "italic" },
            }}
          >
            {diary.content}
          </Markdown>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push("/(user)/diary")}
          >
            <Feather name="book-open" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>View All Diaries</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  },
  backIcon: {
    position: "absolute",
    top: 16,
    left: 16,
    padding: 8,
    zIndex: 10,
  },
  shareIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  headerContent: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerDate: {
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  markdownContainer: {
    padding: 16,
    borderRadius: 12,
  },
  actionsContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  // New styles for images
  imagesSection: {
    marginBottom: 16,
  },
  imagesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  diaryImage: {
    width: 250,
    height: 180,
    borderRadius: 12,
  },
  imageInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  imageLocation: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  imageDate: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});
