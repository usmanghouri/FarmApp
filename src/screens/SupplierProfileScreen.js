import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile version of src/pages/SupplierProfile.jsx.
// Use the same supplier profile APIs as the web app.

export default function SupplierProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Supplier Profile</Text>
      <Text style={styles.text}>
        Show and edit supplier profile details here using the same supplier profile APIs.
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


