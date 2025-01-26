import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../utils/ThemeContext";

const mockSolutions = [
  {
    id: "1",
    issue: "Poor Wi-Fi connectivity",
    solution: "Upgrade router firmware and add more access points",
    date: "Mar 15, 2024",
  },
  {
    id: "2",
    issue: "Lack of vegetarian food options",
    solution: "Introduce new vegetarian menu items and clearly label them",
    date: "Mar 10, 2024",
  },
  {
    id: "3",
    issue: "Insufficient parking space",
    solution: "Implement valet parking service during peak hours",
    date: "Mar 20, 2024",
  },
  {
    id: "4",
    issue: "Noisy air conditioning",
    solution: "Schedule regular maintenance and replace old units",
    date: "Mar 25, 2024",
  },
  {
    id: "5",
    issue: "Long check-in process",
    solution: "Implement mobile check-in and increase staff during peak hours",
    date: "Mar 05, 2024",
  },
];

export default function Solutions() {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 24,
      marginTop: 12,
    },
    cardContainer: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    blurContainer: {
      overflow: "hidden",
      borderRadius: 16,
    },
    solutionItem: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    solutionContent: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    textContainer: {
      flex: 1,
    },
    issueTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 4,
    },
    date: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    solutionText: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
  });

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInLeft.duration(400).delay(index * 100)}
      style={styles.cardContainer}
    >
      <BlurView
        intensity={isDark ? 20 : 60}
        tint={isDark ? "dark" : "light"}
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
            isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.02)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.solutionItem}
        >
          <View style={styles.solutionContent}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Feather name="zap" size={24} color={theme.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.issueTitle}>{item.issue}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
            <Text style={styles.solutionText}>{item.solution}</Text>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solutions Hub</Text>
      <FlatList
        data={mockSolutions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
