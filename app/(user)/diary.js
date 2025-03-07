import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import React, { useState, useEffect, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Markdown from "react-native-markdown-display";

// Import the required polyfills first - important order!
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Conditionally import AWS SDK in try/catch to handle web environment
let AWS;
try {
  AWS = require("aws-sdk");
  console.log("AWS SDK imported successfully");
} catch (error) {
  console.error("Error importing AWS SDK:", error);
}

// AWS S3 configuration
const BUCKET_NAME = "tourismaiassistant2025";
const REGION = "eu-north-1";
const ACCESS_KEY = "AKIAWOAVR6475DVC5HMS";
const SECRET_KEY = "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";

// Configure AWS - ensure we're running in an environment that supports it
let s3 = null;

try {
  if (AWS) {
    AWS.config.update({
      region: REGION,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    });

    s3 = new AWS.S3();
    console.log("AWS SDK initialized successfully");
  }
} catch (error) {
  console.error("Error initializing AWS SDK:", error);
}

// Function to upload file to S3 using AWS SDK v2 (web compatible)
const uploadFileToS3 = async (uri, fileName) => {
  try {
    console.log(`Starting upload of ${fileName} from ${uri}`);

    // If S3 is not initialized, use a simulated upload
    if (!s3) {
      console.log("S3 client not available, simulating upload");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
      return fileName;
    }

    // For web, fetch the image data
    const response = await fetch(uri);
    const blob = await response.blob();

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: blob,
      ContentType: blob.type || "image/jpeg",
    };

    const result = await s3.upload(params).promise();
    console.log(`Successfully uploaded ${fileName} to S3:`, result.Location);
    return fileName;
  } catch (error) {
    console.error("Error uploading to S3:", error);

    // For development, return the filename anyway to continue the flow
    if (Platform.OS === "web" && process.env.NODE_ENV === "development") {
      console.log(
        "Continuing with simulated upload due to error in development mode"
      );
      return fileName;
    }

    throw error;
  }
};

// Individual form item components
const DateInput = ({ index, initialValue, updateMetadata, darkMode }) => {
  const [text, setText] = useState(initialValue || "");

  const handleBlur = () => {
    updateMetadata(index, "date", text);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={[styles.inputLabel, { color: darkMode ? "#FFFFFF" : "#000000" }]}
      >
        Date
      </Text>
      <TextInput
        style={[
          styles.metadataInput,
          {
            color: darkMode ? "#FFFFFF" : "#000000",
            borderColor: darkMode ? "#555555" : "#DDDDDD",
          },
        ]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={darkMode ? "#AAAAAA" : "#999999"}
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        keyboardType="default"
        returnKeyType="done"
      />
    </View>
  );
};

const LocationInput = ({ index, initialValue, updateMetadata, darkMode }) => {
  const [text, setText] = useState(initialValue || "");

  const handleBlur = () => {
    updateMetadata(index, "location", text);
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={[styles.inputLabel, { color: darkMode ? "#FFFFFF" : "#000000" }]}
      >
        Location
      </Text>
      <TextInput
        style={[
          styles.metadataInput,
          {
            color: darkMode ? "#FFFFFF" : "#000000",
            borderColor: darkMode ? "#555555" : "#DDDDDD",
          },
        ]}
        placeholder="Enter location"
        placeholderTextColor={darkMode ? "#AAAAAA" : "#999999"}
        value={text}
        onChangeText={setText}
        onBlur={handleBlur}
        keyboardType="default"
        returnKeyType="done"
      />
    </View>
  );
};

export default function Diary() {
  const { theme, darkMode } = useTheme();
  const [step, setStep] = useState("initial");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageMetadata, setImageMetadata] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [diaryContent, setDiaryContent] = useState("");

  // Initialize empty state for image selection
  useEffect(() => {
    if (selectedImages.length > 0) {
      const initialMetadata = selectedImages.map((image) => ({
        uri: image.uri,
        date: "",
        location: "",
        uploadedName: "",
      }));
      setImageMetadata(initialMetadata);

      // Initialize upload progress for each image
      const initialProgress = {};
      selectedImages.forEach((_, index) => {
        initialProgress[index] = { status: "pending", progress: 0 };
      });
      setUploadProgress(initialProgress);
    }
  }, [selectedImages]);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Sorry, we need camera roll permissions to upload images!"
        );
      }
    })();
  }, []);

  // Function to pick images from gallery
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
        selectionLimit: 3,
      });

      if (!result.canceled) {
        const newImages = result.assets.slice(0, 3);
        setSelectedImages(newImages);

        // Initialize metadata for each image
        const initialMetadata = newImages.map((img) => ({
          uri: img.uri,
          date: "",
          location: "",
          uploadedName: "",
        }));

        setImageMetadata(initialMetadata);
        setStep("uploading");
      }
    } catch (error) {
      console.log("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images");
    }
  };

  // Function to update metadata for a specific image
  const updateMetadata = (index, field, value) => {
    // Only update if we have a valid index and field
    if (index >= 0 && index < imageMetadata.length && field) {
      setImageMetadata((prev) => {
        // Create a new array to avoid direct state mutation
        const updated = [...prev];
        // Update only the specific field
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    }
  };

  // Function to upload all selected images to S3
  const uploadImagesToS3 = async () => {
    try {
      setUploading(true);

      // Check if all images have metadata
      const missingMetadata = imageMetadata.some(
        (img) => !img.date || !img.location
      );

      if (missingMetadata) {
        Alert.alert(
          "Missing Information",
          "Please enter date and location for all images."
        );
        setUploading(false);
        return;
      }

      // Upload each image to S3 and store the S3 URL for each
      const updatedMetadata = [...imageMetadata];

      for (let i = 0; i < imageMetadata.length; i++) {
        try {
          setUploadProgress((prev) => ({
            ...prev,
            [i]: { status: "uploading", progress: 0 },
          }));

          // Generate a unique filename for S3
          const timestamp = Date.now();
          const uniqueId = uuidv4();
          const fileName = `${timestamp}-${uniqueId}.jpg`;

          console.log(
            `Processing image ${i + 1}/${imageMetadata.length}: ${fileName}`
          );

          // Upload the image to S3
          const uploadedName = await uploadFileToS3(
            imageMetadata[i].uri,
            fileName
          );

          // Update the metadata with the S3 filename
          updatedMetadata[i] = {
            ...updatedMetadata[i],
            uploadedName,
          };

          setUploadProgress((prev) => ({
            ...prev,
            [i]: { status: "complete", progress: 100 },
          }));

          console.log(`Successfully processed image ${i + 1}`);
        } catch (error) {
          console.log(`Failed to upload image ${i + 1}:`, error);
          setUploadProgress((prev) => ({
            ...prev,
            [i]: { status: "error", progress: 0 },
          }));
          throw new Error(`Failed to upload image ${i + 1}: ${error.message}`);
        }
      }

      // After all uploads are complete, create the diary
      setImageMetadata(updatedMetadata);
      console.log("All uploads complete. Creating diary...");
      createDiary(updatedMetadata);
    } catch (error) {
      console.log("Error uploading images:", error);
      setUploading(false);
      Alert.alert(
        "Upload Error",
        "Failed to upload one or more images. Please try again."
      );
    }
  };

  // Function to create diary by calling the ML API
  const createDiary = async (metadata) => {
    try {
      setLoading(true);

      // Prepare the payload for the ML API
      const image_dict = metadata.map((img) => ({
        image_path: img.uploadedName,
        date: img.date,
        location: img.location,
      }));

      console.log("Sending request to ML API:", { image_dict });

      // Call the ML API
      const response = await axios.post(
        "http://ec2-13-50-235-60.eu-north-1.compute.amazonaws.com:5001/create_diary",
        { image_dict },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000, // 60 second timeout for ML processing
        }
      );

      console.log("Received response from ML API:", response.data);

      // Set diary content and move to rendering step
      setDiaryContent(response.data.diary_content);
      setStep("rendering");
      setLoading(false);
    } catch (error) {
      console.log("Error creating diary:", error);
      setLoading(false);
      Alert.alert(
        "Error",
        "Failed to generate diary content. Please try again later."
      );
    }
  };

  // Initial screen with Generate Diary button
  const InitialScreen = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: theme.text }]}>Travel Diary</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Capture your travel memories and experiences
        </Text>
      </View>

      <View style={styles.illustrationContainer}>
        <View
          style={[
            styles.illustrationPlaceholder,
            { backgroundColor: theme.primary + "30" },
          ]}
        >
          <Feather name="book-open" size={60} color={theme.primary} />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={pickImages}
        >
          <Feather
            name="plus"
            size={20}
            color="white"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Generate Diary</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.emptyStateContainer, { borderColor: theme.border }]}>
        <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
          No diary entries yet. Create your first memory!
        </Text>
      </View>
    </>
  );

  // Upload screen with image selection and metadata inputs
  const UploadScreen = () => (
    <Animated.View entering={FadeInDown.duration(800)} style={styles.container}>
      <Text style={[styles.title, { color: darkMode ? "#FFFFFF" : "#000000" }]}>
        Upload Images
      </Text>
      <ScrollView
        style={styles.uploadContainer}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {imageMetadata.map((image, index) => (
          <View
            key={index}
            style={[
              styles.imageContainer,
              {
                marginBottom: 24,
                backgroundColor: darkMode ? "#222222" : "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: darkMode ? 0.3 : 0.1,
                shadowRadius: 4,
                elevation: 3,
              },
            ]}
          >
            <Image
              source={{ uri: image.uri }}
              style={[styles.image, { borderRadius: 8, marginBottom: 16 }]}
            />
            <View style={styles.metadataContainer}>
              <DateInput
                index={index}
                initialValue={image.date}
                updateMetadata={updateMetadata}
                darkMode={darkMode}
              />
              <LocationInput
                index={index}
                initialValue={image.location}
                updateMetadata={updateMetadata}
                darkMode={darkMode}
              />
              {uploadProgress[index] && (
                <View
                  style={[
                    styles.uploadStatus,
                    uploadProgress[index].status === "uploading"
                      ? styles.uploading
                      : uploadProgress[index].status === "complete"
                      ? styles.uploadComplete
                      : styles.uploadFailed,
                  ]}
                >
                  {uploadProgress[index].status === "uploading" && (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  )}
                  <Text style={styles.uploadStatusText}>
                    {uploadProgress[index].status === "uploading"
                      ? "Uploading..."
                      : uploadProgress[index].status === "complete"
                      ? "Complete"
                      : "Failed"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary,
                opacity: uploading ? 0.7 : 1,
              },
            ]}
            onPress={uploadImagesToS3}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Generate Diary</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Animated.View>
  );

  // Diary display screen
  const DiaryScreen = () => (
    <ScrollView
      style={[styles.diaryContainer, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.text, marginBottom: 20 }]}>
        Your Travel Diary
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Generating your diary...
          </Text>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.diaryContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <Markdown
              style={{
                body: { color: theme.text, fontSize: 16, lineHeight: 24 },
                heading1: {
                  color: theme.primary,
                  fontSize: 24,
                  marginBottom: 10,
                  marginTop: 20,
                },
                heading2: {
                  color: theme.primary,
                  fontSize: 20,
                  marginBottom: 10,
                  marginTop: 20,
                },
                heading3: {
                  color: theme.primary,
                  fontSize: 18,
                  marginBottom: 10,
                  marginTop: 15,
                },
                hr: {
                  backgroundColor: theme.border,
                  height: 1,
                  marginVertical: 15,
                },
                strong: { fontWeight: "bold", color: theme.text },
              }}
            >
              {diaryContent}
            </Markdown>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              { backgroundColor: theme.primary, marginTop: 20 },
            ]}
            onPress={() => {
              setSelectedImages([]);
              setImageMetadata([]);
              setDiaryContent("");
              setUploadProgress({});
              setStep("initial");
            }}
          >
            <Text style={styles.buttonText}>Create New Diary</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primary + "20", theme.background, theme.background]}
        style={styles.gradient}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.content}>
          {step === "initial" && <InitialScreen />}
          {step === "uploading" && <UploadScreen />}
          {step === "rendering" && <DiaryScreen />}
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  illustrationPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  // Upload screen styles
  uploadContainer: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  metadataContainer: {
    padding: 15,
  },
  metadataInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    width: "100%",
  },
  uploadStatus: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  uploading: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  uploadComplete: {
    backgroundColor: "rgba(39, 174, 96, 0.8)",
  },
  uploadFailed: {
    backgroundColor: "rgba(231, 76, 60, 0.8)",
  },
  uploadStatusText: {
    color: "white",
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "bold",
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 10,
  },
  generateButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  disabledButton: {
    opacity: 0.7,
  },
  // Diary screen styles
  diaryContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  diaryContent: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  buttonRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
