import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../utils/ThemeContext";

export default function UserDashboard() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Welcome to Tourism App</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Start planning your next trip!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
});