import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from '../utils/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function Index() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const stats = [
    {
      title: "Total Issues",
      value: "24",
      icon: "alert-circle",
      color: theme.primary,
    },
    { 
      title: "Solved Issues", 
      value: "18", 
      icon: "check-circle", 
      color: "#10B981" 
    },
    { 
      title: "Positive Reviews", 
      value: "85%", 
      icon: "thumbs-up", 
      color: "#10B981" 
    },
    { 
      title: "Negative Reviews", 
      value: "15%", 
      icon: "thumbs-down", 
      color: "#EF4444" 
    },
  ];

  const recentActivities = [
    { id: '1', title: 'New Wi-Fi router installed', time: '2 hours ago', icon: 'wifi' },
    { id: '2', title: 'Restaurant menu updated', time: '5 hours ago', icon: 'book-open' },
    { id: '3', title: 'Room 304 maintenance', time: '1 day ago', icon: 'tool' },
  ];

  const quickActions = [
    { 
      id: '1', 
      title: 'Top Rated Issues', 
      icon: 'bar-chart-2', 
      color: '#F59E0B',
      onPress: () => navigation.navigate('issues')
    },
    { 
      id: '2', 
      title: 'Resolve Issue', 
      icon: 'check-circle', 
      color: '#10B981',
      onPress: () => navigation.navigate('solutions')
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 24,
      marginTop: 12,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    cardContainer: {
      width: '48%',
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    blurContainer: {
      overflow: 'hidden',
      borderRadius: 16,
    },
    statCard: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
    },
    statTitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginTop: 24,
      marginBottom: 16,
    },
    activityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.primary}20`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginBottom: 4,
    },
    activityTime: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    quickActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    quickActionButton: {
      width: (width - 56) / 3,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)',
    },
    quickActionIcon: {
      marginBottom: 8,
    },
    quickActionTitle: {
      fontSize: 14,
      color: theme.text,
      textAlign: 'center',
    },
  });

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      onPress={action.onPress}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.quickActionButton, { width: (width - 40) / 2 }]}
      >
        <Feather
          name={action.icon}
          size={24}
          color={action.color}
          style={styles.quickActionIcon}
        />
        <Text style={styles.quickActionTitle}>{action.title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Hotel Dashboard</Text>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <Animated.View 
            key={stat.title}
            entering={FadeInDown.duration(400).delay(index * 100)}
            style={styles.cardContainer}
          >
            <BlurView intensity={isDark ? 20 : 60} tint={isDark ? "dark" : "light"} style={styles.blurContainer}>
              <LinearGradient
                colors={[
                  isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                  isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.02)'
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
                  <Feather name={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        {quickActions.map(renderQuickAction)}
      </View>

      <Text style={styles.sectionTitle}>Recent Activities</Text>
      {recentActivities.map((activity, index) => (
        <Animated.View
          key={activity.id}
          entering={FadeInDown.duration(400).delay(index * 100)}
        >
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Feather name={activity.icon} size={20} color={theme.primary} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
}
