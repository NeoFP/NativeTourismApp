import { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  SlideInRight,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  FadeInUp
} from 'react-native-reanimated';
import { useTheme } from '../../utils/ThemeContext';
import { SvgXml } from 'react-native-svg';
import airplaneSvg from '../../assets/images/airplane';
import luggageSvg from '../../assets/images/luggage';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function Login() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const floatAnimation = useSharedValue(0);

  useEffect(() => {
    floatAnimation.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2000 }),
        withTiming(-10, { duration: 2000 }),
      ),
      -1,
      true
    );
  }, []);

  const balloonStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnimation.value }],
  }));

  const handleLogin = async () => {
    setIsLoading(true);
    setShowLoadingModal(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      if (email.includes('admin')) {
        await AsyncStorage.setItem('userType', 'admin');
        await AsyncStorage.setItem('token', 'your-token-here');
        router.replace('/(admin)');
      } else {
        await AsyncStorage.setItem('userType', 'user');
        await AsyncStorage.setItem('token', 'your-token-here');
        router.replace('/(user)');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
      setShowLoadingModal(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Background Illustrations */}
      <Animated.View
        entering={FadeInDown.duration(1000).delay(300)}
        style={[styles.airplaneIcon, { opacity: 0.1 }]}
      >
        <SvgXml xml={airplaneSvg} width={60} height={60} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(1000).delay(500)}
        style={[styles.luggageIcon, { opacity: 0.1 }]}
      >
        <SvgXml xml={luggageSvg} width={40} height={40} />
      </Animated.View>

      {/* Main Content */}
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
        style={styles.content}
      >
        {/* Replace balloon with Lottie */}
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../../assets/animations/login-animation.json')}
            autoPlay
            loop
            style={[
              styles.loginAnimation,
              Platform.OS === 'web' && styles.webLoginAnimation
            ]}
            resizeMode="contain"
            renderMode={Platform.OS === 'web' ? 'svg' : 'automatic'}
            cacheStrategy="strong"
          />
        </View>

        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Animated.Text 
              entering={SlideInRight.duration(800).delay(400)}
              style={[styles.welcomeText, { color: theme.textSecondary }]}
            >
              Welcome to
            </Animated.Text>
            <Animated.Text 
              entering={SlideInRight.duration(800).delay(600)}
              style={[styles.title, { color: theme.text }]}
            >
              TravelEase
            </Animated.Text>
            <Animated.Text 
              entering={FadeInRight.duration(800).delay(800)}
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              Your gateway to seamless travel experiences
            </Animated.Text>
          </View>
        </View>

        <Animated.View 
          entering={FadeInDown.duration(1000).delay(1000)}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: isDark ? theme.background : '#F9FAFB',
                borderWidth: 1,
                borderColor: theme.border
              }
            ]}>
              <Feather name="mail" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={[
              styles.inputWrapper, 
              { 
                backgroundColor: isDark ? theme.background : '#F9FAFB',
                borderWidth: 1,
                borderColor: theme.border
              }
            ]}>
              <Feather name="lock" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button]}
            onPress={handleLogin}
          >
            <LinearGradient
              colors={[theme.primary, '#818CF8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <Feather name="loader" size={24} color="white" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Feather name="arrow-right" size={20} color="white" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Animated.Text 
            entering={FadeInRight.duration(800).delay(1200)}
            style={[styles.footerText, { color: theme.textSecondary }]}
          >
            Experience the future of travel management
          </Animated.Text>
        </Animated.View>
      </Animated.View>

      {/* Loading Modal */}
      <Modal
        transparent
        visible={showLoadingModal}
        animationType="fade"
      >
        <BlurView
          intensity={isDark ? 20 : 60}
          tint={isDark ? "dark" : "light"}
          style={styles.modalContainer}
        >
          <View style={styles.loadingContainer}>
            {Platform.OS === 'web' ? (
              <View style={styles.webLoadingContainer}>
                <Feather name="loader" size={48} color={theme.primary} />
              </View>
            ) : (
              <LottieView
                source={require('../../assets/animations/travel-loading.json')}
                autoPlay
                loop
                style={styles.lottieAnimation}
              />
            )}
            <Animated.Text 
              entering={FadeInUp.springify()}
              style={[styles.loadingText, { color: theme.text }]}
            >
              {email.includes('admin') ? 'Preparing Admin Dashboard...' : 'Getting Ready for Your Journey...'}
            </Animated.Text>
          </View>
        </BlurView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  button: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    width: '100%',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 14,
    opacity: 0.8,
  },
  airplaneIcon: {
    position: 'absolute',
    top: '10%',
    right: '5%',
    transform: [{ rotate: '-15deg' }],
  },
  luggageIcon: {
    position: 'absolute',
    bottom: '10%',
    left: '5%',
  },
  lottieContainer: {
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    height: Platform.OS === 'web' ? 250 : 200,
    width: '100%',
    position: 'relative',
  },
  loginAnimation: {
    width: 200,
    height: 200,
  },
  webLoginAnimation: {
    position: 'absolute',
    width: 250,
    height: 250,
    top: 0,
    left: '50%',
    transform: [{ translateX: -125 }],
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  webLoadingContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 