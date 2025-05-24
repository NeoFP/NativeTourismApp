import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";
import ReviewForm from "./ReviewForm";

export default function WriteReviewButton({ 
  placeName = "", 
  placeType = "",
  buttonText = "Write a Review",
  style = {},
  size = "medium" // small, medium, large
}) {
  const { theme } = useTheme();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          padding: 8,
          fontSize: 14,
          iconSize: 16,
        };
      case "large":
        return {
          padding: 16,
          fontSize: 18,
          iconSize: 20,
        };
      default: // medium
        return {
          padding: 12,
          fontSize: 16,
          iconSize: 18,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <>
      <TouchableOpacity
        style={[
          styles.writeReviewButton,
          { 
            backgroundColor: theme.primary,
            padding: sizeStyles.padding,
          },
          style
        ]}
        onPress={() => setShowReviewForm(true)}
        activeOpacity={0.8}
      >
        <Feather
          name="edit-3"
          size={sizeStyles.iconSize}
          color="#FFF"
          style={styles.buttonIcon}
        />
        <Text style={[styles.writeReviewButtonText, { fontSize: sizeStyles.fontSize }]}>
          {buttonText}
        </Text>
      </TouchableOpacity>

      <ReviewForm
        visible={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        theme={theme}
        initialData={{
          locationName: placeName,
          locationType: placeType
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  writeReviewButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});