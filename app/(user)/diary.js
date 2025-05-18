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
  Image,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { getUserId } from "../../utils/mongodb";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToS3, extractLocationFromImage } from "../../utils/awsS3";
import * as MediaLibrary from "expo-media-library";

const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";
const GOOGLE_MAPS_API_KEY = "AIzaSyC4JRnkYeIb6Bcrn6pAMYLtPVNGScCy2ak";

export default function DiaryScreen() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaries, setDiaries] = useState([]);
  const [loadingDiaries, setLoadingDiaries] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Image handling state
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageData, setImageData] = useState([]);

  useEffect(() => {
    loadDiaries();
  }, []);

  const loadDiaries = async () => {
    setLoadingDiaries(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        throw new Error("User not logged in");
      }

      const response = await fetch(
        `${API_URL}/get_user_diaries/${encodeURIComponent(userId)}`,
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

  // Image selection functionality
  const pickImages = async () => {
    try {
      // Request both media library and camera roll permissions
      const libraryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();

      if (!libraryPermission.granted) {
        Alert.alert(
          "Permission Required",
          "You need to grant permission to access your photo library"
        );
        return;
      }

      // Launch image picker with exif option enabled
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        exif: true, // Include image metadata
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log("Selected images:", result.assets.length);

        // Check if we have EXIF data
        const hasExifData = result.assets.some((asset) => asset.exif);
        console.log("Images contain EXIF data:", hasExifData);

        setSelectedImages(result.assets);

        // Alert user about the next steps
        Alert.alert(
          "Images Selected",
          `${result.assets.length} images selected. Now we'll extract location data from these images.`,
          [{ text: "OK", onPress: () => processImages(result.assets) }]
        );
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to select images");
    }
  };

  // Process the selected images to extract metadata
  const processImages = async (images) => {
    setUploadingImages(true);

    try {
      const processedData = [];

      // Process each image
      for (const image of images) {
        // Extract location from image metadata
        const locationData = await extractLocationFromImage(
          image.uri,
          GOOGLE_MAPS_API_KEY
        );

        // Format date from image metadata or use current date
        const imageDate = image.exif?.DateTimeOriginal
          ? new Date(image.exif.DateTimeOriginal)
          : new Date();

        const formattedDate = imageDate.toISOString().split("T")[0]; // YYYY-MM-DD format

        // Add to processed data
        processedData.push({
          uri: image.uri,
          location: locationData.locationName,
          date: formattedDate,
          coordinates: locationData.coordinates,
        });
      }

      setImageData(processedData);

      // Show confirmation to the user
      Alert.alert(
        "Images Processed",
        `Location data extracted from ${processedData.length} images. Ready to generate your diary.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error processing images:", error);
      Alert.alert("Error", "Failed to process images");
    } finally {
      setUploadingImages(false);
    }
  };

  // Upload images to S3 and generate diary
  const uploadImagesAndGenerateDiary = async () => {
    if (selectedImages.length === 0 || imageData.length === 0) {
      Alert.alert("Error", "Please select images first");
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

      // Upload each image to S3
      const uploadedImages = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        const data = imageData[i];

        // Upload to S3 and get file name
        const fileName = await uploadImageToS3(image.uri);

        // Add to uploaded images array
        uploadedImages.push({
          image_path: fileName,
          date: data.date,
          location: data.location,
        });
      }

      // Prepare the API request payload
      const payload = {
        image_dict: uploadedImages,
        _id: userId,
      };

      console.log("Sending images to API:", payload);

      // Send to backend API
      const response = await fetch(`${API_URL}/generate_diary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate diary: ${response.status}`);
      }

      const responseData = await response.json();

      // Create new diary entry
      const newDiary = {
        id: Date.now().toString(),
        title: diaryTitle,
        content:
          responseData.content || "Your travel memories with beautiful images.",
        date: new Date().toISOString(),
        images: uploadedImages,
      };

      // Add to local state
      const updatedDiaries = [newDiary, ...diaries];
      setDiaries(updatedDiaries);

      // Reset form
      setDiaryTitle("");
      setSelectedImages([]);
      setImageData([]);
      setShowCreateForm(false);

      // Store locally
      try {
        await AsyncStorage.setItem(
          "userDiaries",
          JSON.stringify(updatedDiaries)
        );
      } catch (err) {
        console.error("Error saving to storage:", err);
      }

      Alert.alert(
        "Success",
        "Your travel diary has been created with your images!"
      );
    } catch (error) {
      console.error("Error generating diary with images:", error);
      Alert.alert("Error", "Failed to create diary with images");
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

  // Render image thumbnails
  const renderImageThumbnails = () => {
    if (selectedImages.length === 0) return null;

    return (
      <View style={styles.thumbnailsContainer}>
        <Text style={[styles.thumbnailsTitle, { color: theme.text }]}>
          Selected Images ({selectedImages.length})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.thumbnailWrapper}>
              <Image source={{ uri: image.uri }} style={styles.thumbnail} />
              {imageData[index] && (
                <View
                  style={[
                    styles.locationBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={styles.locationText} numberOfLines={1}>
                    {imageData[index].location}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

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
                Create a Travel Diary
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

              {/* Image selection section */}
              <View style={styles.imageSelectionSection}>
                <Text style={[styles.sectionLabel, { color: theme.text }]}>
                  Add Photos to Your Diary
                </Text>
                <TouchableOpacity
                  style={[
                    styles.imagePickerButton,
                    {
                      backgroundColor: theme.primary + "20",
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={pickImages}
                  disabled={uploadingImages}
                >
                  <Feather name="image" size={20} color={theme.primary} />
                  <Text
                    style={[styles.imagePickerText, { color: theme.primary }]}
                  >
                    {selectedImages.length > 0
                      ? `Selected ${selectedImages.length} images`
                      : "Select Photos from Device"}
                  </Text>
                </TouchableOpacity>

                {uploadingImages && (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                    <Text
                      style={[styles.processingText, { color: theme.text }]}
                    >
                      Processing images...
                    </Text>
                  </View>
                )}

                {renderImageThumbnails()}
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={() => {
                    setShowCreateForm(false);
                    setSelectedImages([]);
                    setImageData([]);
                  }}
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
                      opacity:
                        generating || selectedImages.length === 0 ? 0.7 : 1,
                    },
                  ]}
                  onPress={uploadImagesAndGenerateDiary}
                  disabled={generating || selectedImages.length === 0}
                >
                  {generating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather
                        name="upload"
                        size={16}
                        color="#FFFFFF"
                        style={styles.buttonIcon}
                      />
                      <Text style={styles.generateButtonText}>
                        Create with Photos
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
                  Create your first diary with your travel photos
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
  // Image picker styles
  imageSelectionSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  thumbnailsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  thumbnailsTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  thumbnailWrapper: {
    position: "relative",
    marginRight: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  locationBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    right: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  locationText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
  },
});
