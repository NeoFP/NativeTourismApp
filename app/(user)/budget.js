import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from "../../utils/ThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';

export default function Budget() {
  const { theme, isDark } = useTheme();
  const [showForm, setShowForm] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        entering={FadeInDown.springify()}
        style={styles.content}
      >
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../assets/animations/budget-animation.json')}
            autoPlay
            loop
            style={styles.animation}
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>
          Take Control of Your Budget
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          Plan your trip details, and we'll create a personalized budget plan to help you save and manage your travel expenses effectively.
        </Text>

        <TouchableOpacity 
          style={styles.buttonContainer}
          onPress={() => router.push('/budget/form')}
        >
          <LinearGradient
            colors={[theme.primary, '#818CF8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent
      >
        <BlurView
          intensity={isDark ? 20 : 60}
          tint={isDark ? "dark" : "light"}
          style={styles.modalContainer}
        >
          {/* BudgetForm component content */}
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  lottieContainer: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: '80%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
    overflow: 'hidden',
    borderRadius: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonArrow: {
    color: 'white',
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
