import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from '../utils/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';

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

  const sentimentData = {
    positive: 142,
    negative: 34,
    neutral: 42,
  };

  const pieChartData = [
    {
      name: "Positive",
      population: 65.1,
      color: "#10B981",
      legendFontColor: theme.text,
      legendFontSize: 12,
    },
    {
      name: "Negative",
      population: 15.6,
      color: "#EF4444",
      legendFontColor: theme.text,
      legendFontSize: 12,
    },
    {
      name: "Neutral",
      population: 19.3,
      color: "#F59E0B",
      legendFontColor: theme.text,
      legendFontSize: 12,
    },
  ];

  const barChartData = {
    labels: ["Positive", "Negative", "Neutral"],
    datasets: [
      {
        data: [142, 34, 42],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: theme.background,
    backgroundGradientTo: theme.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => theme.text,
    style: {
      borderRadius: 16,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

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
    chartContainer: {
      marginBottom: 24,
      borderRadius: 16,
      overflow: 'hidden',
    },
    chartBlur: {
      overflow: 'hidden',
      borderRadius: 16,
    },
    chartGradient: {
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
    },
    chartLegend: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    chartsWrapper: {
      alignItems: 'center',
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
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

  const renderSentimentAnalysis = () => (
    <>
      <Text style={styles.sectionTitle}>Sentiment Analysis</Text>
      <View style={styles.chartContainer}>
        <BlurView 
          intensity={isDark ? 20 : 60} 
          tint={isDark ? "dark" : "light"} 
          style={styles.chartBlur}
        >
          <LinearGradient
            colors={[
              isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
              isDark ? "rgba(99, 102, 241, 0.05)" : "rgba(99, 102, 241, 0.02)",
            ]}
            style={styles.chartGradient}
          >
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Distribution</Text>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Positive</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Negative</Text>
                </View>
              </View>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartsWrapper}>
                <BarChart
                  data={barChartData}
                  width={width - 80}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chart}
                  showValuesOnTopOfBars
                />
                
                <PieChart
                  data={pieChartData}
                  width={width - 80}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </ScrollView>
          </LinearGradient>
        </BlurView>
      </View>
    </>
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

      {renderSentimentAnalysis()}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        {quickActions.map(renderQuickAction)}
      </View>
    </ScrollView>
  );
}
