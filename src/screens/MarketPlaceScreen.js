import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile version of src/pages/MarketPlace.jsx.
// Fetch marketplace products using the same endpoints as the web page.

export default function MarketPlaceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Marketplace</Text>
      <Text style={styles.text}>
        Show marketplace products here, using the same listing and filter APIs as on the web.
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


