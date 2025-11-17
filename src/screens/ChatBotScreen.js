import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import dayjs from "dayjs";
import { apiClient } from "../api/client";

// Mobile port of src/components/Chat.jsx using the same chatbot API.

export default function ChatBotScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FarmConnect Bot</Text>
        <Text style={styles.headerSubtitle}>Ask about farming & market insights</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about crops, fertilizers, prices..."
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb"
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#16a34a"
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700"
  },
  headerSubtitle: {
    color: "#bbf7d0",
    fontSize: 12,
    marginTop: 2
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 4
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  messageUser: {
    backgroundColor: "#16a34a",
    borderBottomRightRadius: 2
  },
  messageBot: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderBottomLeftRadius: 2
  },
  messageTextUser: {
    color: "#ffffff"
  },
  messageTextBot: {
    color: "#111827"
  },
  timeText: {
    marginTop: 4,
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "right"
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14
  },
  sendButton: {
    borderRadius: 24,
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center"
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af"
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600"
  }
});


