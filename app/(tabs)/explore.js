import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../utils/ThemeContext";

export default function Explore() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>
        Explore Sri Lanka
      </Text>
      <Text style={[styles.subText, { color: theme.textSecondary }]}>
        Coming soon!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
  },
});
