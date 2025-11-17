import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/BuyerProducts.jsx.
// Fetch available products using the same endpoints as the web buyer products page.

export default function BuyerProductsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Buyer Products</Text>
      <Text style={styles.text}>
        Show products available for buyers here using the same product listing APIs.
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


