import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../utils/ThemeContext";
import { Feather } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { getUserDiaries } from "../../utils/mongodb";

const { width } = Dimensions.get("window");
const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function DiaryDetails() {
  const { diaryId } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [diary, setDiary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiaryDetails();
  }, [diaryId]);

  const fetchDiaryDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDiaries();

      if (response && response.diaries) {
        const foundDiary = response.diaries.find((d) => d._id === diaryId);
        if (foundDiary) {
          setDiary(foundDiary);
        } else {
          setError("Diary not found");
        }
      } else {
        setError("Failed to fetch diary details");
      }
    } catch (err) {
      console.error("Error fetching diary details:", err);
      setError("An error occurred while fetching diary details");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    // Construct the image URL based on the image path
    return `${API_URL}/static/diary_images/${imagePath}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading diary...
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

  if (!diary) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Feather name="file-minus" size={48} color={theme.textSecondary} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Diary not found
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

        {/* Images gallery */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {diary.images && diary.images.length > 0 ? (
            diary.images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: getImageUrl(image.image_path) }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View
                  style={[
                    styles.imageOverlay,
                    { backgroundColor: "rgba(0,0,0,0.3)" },
                  ]}
                >
                  <Text style={styles.imageLocation}>{image.location}</Text>
                  <Text style={styles.imageDate}>{image.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <View
              style={[
                styles.noImageContainer,
                { backgroundColor: theme.cardAlt },
              ]}
            >
              <Feather name="image" size={40} color={theme.textSecondary} />
              <Text
                style={[styles.noImageText, { color: theme.textSecondary }]}
              >
                No images available
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Diary content */}
        <View
          style={[styles.contentContainer, { backgroundColor: theme.card }]}
        >
          <Markdown
            style={{
              body: { color: theme.text, fontSize: 16, lineHeight: 24 },
              heading1: {
                color: theme.text,
                fontSize: 24,
                fontWeight: "bold",
                marginBottom: 16,
                marginTop: 8,
              },
              heading2: {
                color: theme.text,
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 14,
                marginTop: 8,
              },
              heading3: {
                color: theme.text,
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 12,
                marginTop: 8,
              },
              paragraph: { marginBottom: 16 },
              strong: { fontWeight: "bold", color: theme.text },
              em: { fontStyle: "italic", color: theme.text },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: theme.primary,
                paddingLeft: 16,
                opacity: 0.9,
              },
              code_block: {
                backgroundColor: isDark ? "#2d2d2d" : "#f5f5f5",
                padding: 12,
                borderRadius: 8,
              },
              code_inline: {
                backgroundColor: isDark ? "#2d2d2d" : "#f5f5f5",
                padding: 4,
                borderRadius: 4,
              },
              bullet_list: { marginBottom: 16 },
              ordered_list: { marginBottom: 16 },
              list_item: { marginBottom: 8 },
            }}
          >
            {diary.content}
          </Markdown>

          <View style={styles.metadataContainer}>
            <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
              Created:{" "}
              {new Date(diary.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
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
  imagesContainer: {
    flexDirection: "row",
    paddingBottom: 16,
  },
  imageWrapper: {
    width: width - 32,
    height: 250,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  imageLocation: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  imageDate: {
    color: "white",
    fontSize: 14,
  },
  noImageContainer: {
    width: width - 32,
    height: 200,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
  },
  contentContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
  },
  metadataContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  metadataText: {
    fontSize: 14,
    fontStyle: "italic",
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
