import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "../api/client";

const CLOUDINARY_UPLOAD_PRESET = "FarmConnect";
const CLOUDINARY_CLOUD_NAME = "dn5edjpzg";

// Mobile version of src/pages/SupplierProfile.jsx.
// Use the same supplier profile APIs as the web app.

export default function SupplierProfileScreen() {
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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/suppliers/me", { withCredentials: true }); // Assuming this endpoint exists
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
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImagePreview(uri);
        uploadImageToCloudinary(uri);
      }
    } catch (pickerError) {
      console.error("Image picker error:", pickerError);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", { uri: imageUri, name: "profile.jpg", type: "image/jpeg" });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        handleChange("profileImage", data.secure_url);
        Alert.alert("Success", "Profile image uploaded!");
      } else {
        Alert.alert("Error", "Failed to upload profile image to Cloudinary.");
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      Alert.alert("Error", "Cloudinary upload error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const payload = { ...formData };
      if (imagePreview && imagePreview !== user.profileImage) {
        payload.profileImage = imagePreview; // Use the uploaded image URL
      } else if (!imagePreview && user.profileImage) {
        payload.profileImage = ""; // Clear image if removed
      }
      await apiClient.put("/api/v1/auth/updateProfile", payload, { withCredentials: true }); // Assuming this endpoint exists
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
      fetchProfile(); // Re-fetch to display updated data
    } catch (err) {
      console.error("Failed to update profile:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Supplier Profile</Text>

      {user && (
        <View style={styles.profileCard}>
          <View style={styles.imageUploadContainer}>
            <Image
              source={imagePreview ? { uri: imagePreview } : require("../../assets/user.png")}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick} disabled={loading}>
                <Text style={styles.imagePickerButtonText}>Change Image</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.label}>Name:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
            />
          ) : (
            <Text style={styles.value}>{user.name}</Text>
          )}

          <Text style={styles.label}>Email:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
            />
          ) : (
            <Text style={styles.value}>{user.email}</Text>
          )}

          <Text style={styles.label}>Address:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => handleChange("address", text)}
            />
          ) : (
            <Text style={styles.value}>{user.address || "N/A"}</Text>
          )}

          <Text style={styles.label}>Phone:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => handleChange("phone", text)}
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.value}>{user.phone || "N/A"}</Text>
          )}

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
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
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff"
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4b5563"
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center"
  },
  profileCard: {
    backgroundColor: "#f0f9eb", // Light green background
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageUploadContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#e0e0e0",
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  imagePickerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8
  },
  value: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 15
  },
  input: {
    height: 50,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 15
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20
  },
  editButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "45%"
  },
  saveButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "45%"
  },
  cancelButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    width: "45%"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  }
});


