import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

const mockIssues = [
  { id: '1', title: 'Poor Wi-Fi connectivity', votes: 150 },
  { id: '2', title: 'Lack of vegetarian food options', votes: 120 },
  { id: '3', title: 'Insufficient parking space', votes: 100 },
  { id: '4', title: 'Noisy air conditioning', votes: 80 },
  { id: '5', title: 'Long check-in process', votes: 75 },
];

export default function Issues() {
  const { theme, isDark } = useTheme();

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
    cardContainer: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
    },
    blurContainer: {
      overflow: 'hidden',
      borderRadius: 16,
    },
    issueItem: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    issueContent: {
      padding: 20,
    },
    textContainer: {
      flex: 1,
    },
    issueTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    voteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    issueVotes: {
      fontSize: 15,
      color: theme.textSecondary,
      fontWeight: '500',
    },
  });

  const renderItem = ({ item, index }) => (
    <Animated.View 
      entering={FadeInRight.duration(400).delay(index * 100)}
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
          style={styles.issueItem}
        >
          <View style={styles.issueContent}>
            <View style={styles.textContainer}>
              <Text style={styles.issueTitle}>{item.title}</Text>
              <View style={styles.voteContainer}>
                <View style={styles.iconContainer}>
                  <Feather name="thumbs-up" size={16} color="#6366F1" />
                </View>
                <Text style={styles.issueVotes}>{item.votes}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reported Issues</Text>
      <FlatList
        data={mockIssues}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
