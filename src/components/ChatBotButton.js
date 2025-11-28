import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

export default function ChatBotButton({ onPress }) {
  return (
    <TouchableOpacity
      style={styles.chatbotButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.minimalContainer}>
        <Ionicons name="sparkles" size={20} color="#667eea" />
        <Text style={styles.aiText}>AI</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatbotButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  minimalContainer: {
    backgroundColor: COLORS.surface,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#667eea",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: "row",
    gap: 2,
  },
  aiText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "700",
  },
});

