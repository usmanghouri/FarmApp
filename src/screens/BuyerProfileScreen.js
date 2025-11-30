import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme"; // Assuming these are defined
import { Feather, Ionicons } from "@expo/vector-icons";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dn5edjpzg";
const CLOUDINARY_UPLOAD_PRESET = "FarmConnect";

export default function BuyerProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    profileImage: "",
  });

  const { logout } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/buyers/me", {
        withCredentials: true,
      });
      setUser(response.data.user);
      setFormData({
        name: response.data.user.name,
        email: response.data.user.email,
        address: response.data.user.address || "",
        phone: response.data.user.phone || "",
        profileImage: response.data.user.profileImage || "",
      });
      setImagePreview(response.data.user.profileImage || null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update profile picture."
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImagePreview(uri);
        await uploadImage(uri);
      }
    } catch (pickerError) {
      console.error("Image picker error:", pickerError);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const uploadImage = async (uri) => {
    try {
      setLoading(true);

      // Upload to Cloudinary first (like web version)
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "upload.jpg",
        type: "image/jpeg",
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type manually - React Native will set it with boundary
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.secure_url) {
        // Update form with Cloudinary URL
        setFormData((prev) => ({
          ...prev,
          profileImage: data.secure_url,
        }));
        Alert.alert("Success", "Image uploaded! Click Save to update profile.");
      } else {
        throw new Error(data.error?.message || "Failed to get image URL");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      Alert.alert("Error", error?.message || "Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      await apiClient.put("/api/v1/auth/updateProfile", payload, {
        withCredentials: true,
      });
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to the original fetched user data
    setFormData({
      name: user.name,
      email: user.email,
      address: user.address || "",
      phone: user.phone || "",
      profileImage: user.profileImage || "",
    });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: () => {
          logout();
          navigation.navigate("Landing"); // Navigate to Landing page after logout
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const avatarUri = imagePreview || "https://i.ibb.co/0jqp8Qf/avatar.png"; // Use a reliable placeholder if needed

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Buyer Profile</Text>

        {user && (
          <View style={styles.profileCard}>
            <View style={styles.imageUploadContainer}>
              <Image source={{ uri: avatarUri }} style={styles.profileImage} />
              {isEditing && (
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handleImagePick}
                  disabled={loading}
                >
                  <Feather name="camera" size={18} color={COLORS.surface} />
                  <Text style={styles.imagePickerButtonText}>Change Image</Text>
                </TouchableOpacity>
              )}
            </View>

            {["name", "email", "phone", "address"].map((field) => (
              <View key={field}>
                <Text style={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData[field]}
                    onChangeText={(text) => handleChange(field, text)}
                    keyboardType={
                      field === "phone"
                        ? "phone-pad"
                        : field === "email"
                        ? "email-address"
                        : "default"
                    }
                    editable={field !== "email"}
                    placeholderTextColor={COLORS.muted}
                  />
                ) : (
                  <Text style={styles.value}>{user[field] || "N/A"}</Text>
                )}
              </View>
            ))}

            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleUpdateProfile}
                  >
                    <Text style={styles.buttonText}>Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={18} color={COLORS.surface} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // FIX: Use SafeAreaView and the soft background color
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0FFF0",
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FFF0",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.mutedDark,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: "center",
  },
  // --- Profile Card ---
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 25, // Increased padding
    marginBottom: 20,
    ...SHADOWS.card,
  },
  imageUploadContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: COLORS.info, // Themed color
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: RADIUS.pill, // Rounded edges
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  imagePickerButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primaryDark, // Themed color
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: COLORS.mutedDark, // Themed color
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  input: {
    height: 48,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.mutedDark,
    marginBottom: 15,
    backgroundColor: COLORS.background, // Slight contrast background
  },
  // --- Action Buttons ---
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  editButton: {
    backgroundColor: COLORS.info, // Themed color
    paddingVertical: 14,
    borderRadius: RADIUS.pill, // Rounded pill shape
    alignItems: "center",
    flex: 1,
    ...SHADOWS.soft,
  },
  saveButton: {
    backgroundColor: COLORS.primary, // Themed color
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    flex: 1,
  },
  cancelButton: {
    backgroundColor: COLORS.muted, // Muted gray color
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    flex: 1,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  // --- Logout Button ---
  logoutButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    flexDirection: "row",
    gap: 10,
    ...SHADOWS.soft,
    shadowColor: COLORS.danger,
  },
  logoutButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "800",
  },
});
