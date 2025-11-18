import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/Orders.jsx.
// For full functionality, call the same order listing APIs as the web app.

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Orders</Text>
      <Text style={styles.text}>
        List all relevant orders here using the same order endpoints as the web Orders page.
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


