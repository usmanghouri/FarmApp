import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // Import for loading spinner
} from "react-native";
import dayjs from "dayjs";
import { apiClient } from "../api/client";
import { Ionicons } from '@expo/vector-icons'; // For the send button icon

// --- Color Palette for Chatbot ---
// NOTE: In a real app, these should come from your centralized theme file (e.g., ../styles/theme)
const COLORS = {
  primary: "#10b981",       // Bright Green (used for user messages and buttons)
  primaryDark: "#047857",   // Dark Green (used for header)
  background: "#f0fdf4",    // Light Mint Green
  textDark: "#1f2937",      // Dark Gray Text
  textMuted: "#6b7280",     // Muted Gray Text/Time
  surface: "#ffffff",       // White Surface
  border: "#e5e7eb",        // Light Border Gray
};

export default function ChatBotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Scroll to the end whenever messages update
  useEffect(() => {
    if (messages.length > 0 && listRef.current) {
      listRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const content = input.trim();
    setInput("");

    const userMsg = {
      id: `${Date.now()}-u`,
      sender: "user",
      message: content,
      time: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Simulate a small delay for a smoother user experience
      await new Promise(resolve => setTimeout(resolve, 500)); 

      const res = await apiClient.post("/api/chatbot/ask", { question: content });
      const reply =
        res.data?.response || res.data?.answer || "I couldn't process that request.";
      const botMsg = {
        id: `${Date.now()}-b`,
        sender: "bot",
        message: reply,
        time: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const botMsg = {
        id: `${Date.now()}-e`,
        sender: "bot",
        message: "Sorry, I’m having trouble connecting. Please try again later.",
        time: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === "user";
    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isUser ? "flex-end" : "flex-start" }
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageUser : styles.messageBot
          ]}
        >
          <Text style={isUser ? styles.messageTextUser : styles.messageTextBot}>
            {item.message}
          </Text>
          <Text style={styles.timeText}>
            {dayjs(item.time).format("h:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  // Render a loading indicator when the bot is thinking
  const renderLoading = () => (
    <View style={[styles.messageRow, { justifyContent: "flex-start" }]}>
      <View style={[styles.messageBubble, styles.messageBot]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      // Adjust offset based on your specific header/tab bar height
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FarmConnect AI Bot 🤖</Text>
        <Text style={styles.headerSubtitle}>Ask about farming, market insights & best practices</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={loading ? renderLoading : null} // Add loading indicator
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about crops, soil health, prices..."
          placeholderTextColor={COLORS.textMuted}
          editable={!loading}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Ionicons 
            name="arrow-up" 
            size={24} 
            color={COLORS.surface} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // Light mint background
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14, // Increased padding
    backgroundColor: COLORS.primaryDark, // Darker green header
    elevation: 4, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  headerTitle: {
    color: COLORS.surface,
    fontSize: 20, // Larger title
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#a7f3d0", // Very light green subtitle
    fontSize: 13,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 10, // Increased vertical padding
    paddingBottom: 20,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 6, // More vertical space between messages
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 12, // Softer corners
    paddingHorizontal: 14, // Increased padding inside bubble
    paddingVertical: 10,
    // Base shadow for all bubbles
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  messageUser: {
    backgroundColor: COLORS.primary, // Bright green for user
    // Customized roundness for the chat tail effect
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 2, 
    marginLeft: 'auto', // Push to the right
  },
  messageBot: {
    backgroundColor: COLORS.surface, // White for bot
    borderWidth: 1,
    borderColor: COLORS.border,
    // Customized roundness for the chat tail effect
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 2,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginRight: 'auto', // Push to the left
  },
  messageTextUser: {
    color: COLORS.surface,
    fontSize: 16, // Slightly larger text
    lineHeight: 22,
  },
  messageTextBot: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 22,
  },
  timeText: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "right"
  },
  inputRow: {
    flexDirection: "row",
    padding: 10, // Increased padding around input
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 25, // More rounded pill shape
    paddingHorizontal: 18,
    paddingVertical: 10, // Increased vertical padding for taller input
    marginRight: 10,
    fontSize: 15,
    minHeight: 45, // Minimum height for better tap target
    maxHeight: 120, // Allows for multi-line input
    color: COLORS.textDark,
  },
  sendButton: {
    width: 45, // Fixed width for a square/circle button
    height: 45, // Fixed height
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    // Add shadow to the send button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.textMuted, // Gray when disabled
    opacity: 0.8,
  },
});