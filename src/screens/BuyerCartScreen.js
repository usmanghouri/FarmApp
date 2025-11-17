import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/BuyerCart.jsx.
// For full functionality, reuse the same cart endpoints as the web buyer cart page.

export default function BuyerCartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Buyer Cart</Text>
      <Text style={styles.text}>
        Show buyer cart items here using the same cart APIs as the web app.
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


