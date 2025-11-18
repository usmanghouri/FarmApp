import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/DeliveryTracking.jsx.
// Reuse the same tracking endpoints as the web app to show delivery status.

export default function DeliveryTrackingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Tracking</Text>
      <Text style={styles.text}>
        Show delivery tracking information here using the same APIs as on the web.
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


