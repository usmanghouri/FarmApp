import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/ProductDetail.jsx.
// Fetch a single product by ID using the same endpoint as the web page.

export default function ProductDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Product Detail</Text>
      <Text style={styles.text}>
        Show detailed product information here using the same product detail API.
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


