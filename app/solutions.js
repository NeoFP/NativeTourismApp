import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../utils/ThemeContext";

const mockSolutions = [
  {
    id: "1",
    issue: "Poor Wi-Fi connectivity",
    solution: "Upgrade router firmware and add more access points",
    status: "In Progress",
    priority: "High",
    assignee: "Tech Team",
    dueDate: "2024-03-15",
  },
  {
    id: "2",
    issue: "Lack of vegetarian food options",
    solution: "Introduce new vegetarian menu items and clearly label them",
    status: "Completed",
    priority: "Medium",
    assignee: "F&B Team",
    dueDate: "2024-03-10",
  },
  {
    id: "3",
    issue: "Insufficient parking space",
    solution: "Implement valet parking service during peak hours",
    status: "Planned",
    priority: "Medium",
    assignee: "Operations",
    dueDate: "2024-03-20",
  },
  {
    id: "4",
    issue: "Noisy air conditioning",
    solution: "Schedule regular maintenance and replace old units",
    status: "In Progress",
    priority: "Low",
    assignee: "Maintenance",
    dueDate: "2024-03-25",
  },
  {
    id: "5",
    issue: "Long check-in process",
    solution: "Implement mobile check-in and increase staff during peak hours",
    status: "Completed",
    priority: "High",
    assignee: "Front Desk",
    dueDate: "2024-03-05",
  },
];

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return '#10B981';
    case 'in progress':
      return '#6366F1';
    case 'planned':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

const getPriorityColor = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

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
    solutionIssue: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text,
      marginBottom: 8,
    },
    solutionText: {
      fontSize: 15,
      color: theme.textSecondary,
      lineHeight: 22,
      marginBottom: 16,
    },
    metaContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
      marginBottom: 8,
    },
    metaText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 6,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginRight: 8,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '500',
    },
  });

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInLeft.duration(400).delay(index * 100)}
      style={styles.cardContainer}
    >
      <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.blurContainer}>
        <LinearGradient
          colors={[
            isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
            isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.02)"
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
                <Text style={styles.solutionIssue}>{item.issue}</Text>
              </View>
            </View>
            
            <Text style={styles.solutionText}>{item.solution}</Text>

            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              <View style={[styles.badge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${getPriorityColor(item.priority)}20` }]}>
                <Text style={[styles.badgeText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority} Priority
                </Text>
              </View>
            </View>

            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Feather name="user" size={14} color={theme.textSecondary} />
                <Text style={styles.metaText}>{item.assignee}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={14} color={theme.textSecondary} />
                <Text style={styles.metaText}>{item.dueDate}</Text>
              </View>
            </View>
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
