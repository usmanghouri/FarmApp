import React from "react";
import { View, Text, StyleSheet } from "react-native";

// Mobile counterpart of src/pages/OrderDetail.jsx.
// Fetch a single order by ID using the same endpoint as on the web.

export default function OrderDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Detail</Text>
      <Text style={styles.text}>
        Show detailed order information here using the same order detail API.
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


