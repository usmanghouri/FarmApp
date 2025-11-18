import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/MarketInsights.jsx.
// Use the same market insights / analytics APIs as the web version.

export default function MarketInsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Market Insights</Text>
      <Text style={styles.text}>
        Display market trends and analytics here using the same APIs as on the web.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff"
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8
  },
  text: {
    fontSize: 14,
    color: "#4b5563"
  }
});


