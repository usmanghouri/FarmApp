import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// Simple mobile equivalent of the animated LandingPage hero section.
// Focuses on the main call-to-action: opening the auth flow.

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>FarmConnect</Text>
        <Text style={styles.subtitle}>
          Connecting Farmers, Buyers & Suppliers on the go.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={() => navigation.navigate("Auth")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate("ChatBot")}
      >
        <Text style={styles.buttonSecondaryText}>Ask FarmConnect Bot</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecfdf3",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  hero: {
    marginBottom: 48,
    alignItems: "center"
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563"
  },
  buttonPrimary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#16a34a",
    alignItems: "center",
    marginBottom: 12
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  buttonSecondary: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#16a34a",
    alignItems: "center"
  },
  buttonSecondaryText: {
    color: "#16a34a",
    fontSize: 16,
    fontWeight: "500"
  }
});


