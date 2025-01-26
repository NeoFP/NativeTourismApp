import { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../utils/ThemeContext';

const { width } = Dimensions.get('window');

export default function Login() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
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
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View 
        entering={FadeInDown.duration(1000).springify()}
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
            style={styles.formContainer}
          >
            <View style={styles.logoContainer}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
                <Feather name="compass" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Tourism App</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Sign in to your account
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
                    color: theme.text,
                  }]}
                  placeholder="Email"
                  placeholderTextColor={theme.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Feather name="lock" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
                    color: theme.text,
                  }]}
                  placeholder="Password"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
            >
              <Text style={styles.buttonText}>Sign In</Text>
              <Feather name="arrow-right" size={20} color="white" style={styles.buttonIcon} />
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    borderRadius: 24,
  },
  formContainer: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 44,
    borderRadius: 12,
    fontSize: 16,
  },
  button: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
}); 