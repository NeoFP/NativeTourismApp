import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

export default function Diary() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Diary</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Record and track your travel memories
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
  },
});
