import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";

export default function ReviewForm({ visible, onClose, theme }) {
  const [locationName, setLocationName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const resetForm = () => {
    setLocationName("");
    setLocationType("");
    setReviewText("");
    setResult(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const submitReview = async () => {
    if (!locationName || !locationType || !reviewText) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    setLoading(true);
    try {
      // Format the data according to the API requirements
      const reviewData = {
        Location_Name: locationName,
        Location_Type: locationType,
        User_Locale: "en_US",
        Published_Date: new Date().toLocaleDateString("en-US"),
        text: reviewText,
      };

      // Send the data to the sentiment analysis API
      const response = await axios.post(
        "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001/analyze_sentiment",
        reviewData
      );

      // Set the result to display to the user
      setResult(response.data);
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "#4CAF50";
      case "negative":
        return "#F44336";
      case "neutral":
        return "#9E9E9E";
      default:
        return theme.text;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground || "#FFFFFF" },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Write a Review
            </Text>

            {!result ? (
              <View style={styles.formContainer}>
                <Text style={[styles.label, { color: theme.text }]}>
                  Location Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.inputBackground || "#F5F5F5",
                    },
                  ]}
                  placeholder="Enter location name"
                  placeholderTextColor={theme.textSecondary}
                  value={locationName}
                  onChangeText={setLocationName}
                />

                <Text style={[styles.label, { color: theme.text }]}>
                  Location Type
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.inputBackground || "#F5F5F5",
                    },
                  ]}
                  placeholder="Hotels and Resorts, Restaurants, etc."
                  placeholderTextColor={theme.textSecondary}
                  value={locationType}
                  onChangeText={setLocationType}
                />

                <Text style={[styles.label, { color: theme.text }]}>
                  Your Review
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      color: theme.text,
                      borderColor: theme.border,
                      backgroundColor: theme.inputBackground || "#F5F5F5",
                    },
                  ]}
                  placeholder="Write your review here..."
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  value={reviewText}
                  onChangeText={setReviewText}
                />

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={submitReview}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.resultContainer}>
                <View style={styles.sentimentResult}>
                  <Text style={[styles.resultLabel, { color: theme.text }]}>
                    Sentiment Analysis Result:
                  </Text>
                  <Text
                    style={[
                      styles.sentimentText,
                      { color: getSentimentColor(result.sentiment) },
                    ]}
                  >
                    {result.sentiment.toUpperCase()}
                  </Text>
                </View>

                <Text style={[styles.messageText, { color: theme.text }]}>
                  {result.message}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={resetForm}
                >
                  <Text style={styles.submitButtonText}>
                    Write Another Review
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.closeButton, { borderColor: theme.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>
                Close
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  scrollContent: {
    paddingVertical: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultContainer: {
    alignItems: "center",
    padding: 20,
  },
  sentimentResult: {
    alignItems: "center",
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  sentimentText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
});
