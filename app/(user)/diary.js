import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Diary() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.primary + "20", theme.background, theme.background]}
        style={styles.gradient}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Travel Diary
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Capture your travel memories and experiences
            </Text>
          </View>

          <View style={styles.illustrationContainer}>
            {/* Placeholder for illustration or image */}
            <View
              style={[
                styles.illustrationPlaceholder,
                { backgroundColor: theme.primary + "30" },
              ]}
            >
              <Feather name="book-open" size={60} color={theme.primary} />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                // Add functionality for creating a new diary entry
                console.log("Create new diary entry");
              }}
            >
              <Feather
                name="plus"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Create Diary Entry</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.emptyStateContainer, { borderColor: theme.border }]}
          >
            <Text
              style={[styles.emptyStateText, { color: theme.textSecondary }]}
            >
              No diary entries yet. Create your first memory!
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  illustrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 30,
  },
  illustrationPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
});
