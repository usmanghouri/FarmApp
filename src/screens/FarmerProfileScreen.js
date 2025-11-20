import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  address: "",
  img: "",
};

const EMPTY_PASSWORD = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function FarmerProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [banner, setBanner] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/farmers/me", { withCredentials: true });
      const user = response.data?.user || {};
      const mapped = {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        img: user.img || "",
      };
      setProfile(mapped);
      setForm(mapped);
    } catch (error) {
      setBanner(error?.response?.data?.message || error.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const showBanner = (message) => {
    setBanner(message);
    if (message) {
      setTimeout(() => setBanner(""), 2600);
    }
  };

  const handleFormChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handlePasswordChange = (key, value) => setPasswordForm((prev) => ({ ...prev, [key]: value }));

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setForm(profile);
    setPasswordForm(EMPTY_PASSWORD);
    setBanner("");
  };

  const saveProfile = async () => {
    try {
      await apiClient.put("/api/farmers/update", form, { withCredentials: true });
      showBanner("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      showBanner(error?.response?.data?.message || error.message || "Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showBanner("Fill all password fields.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showBanner("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showBanner("New password must be at least 6 characters.");
      return;
    }
    try {
      await apiClient.put(
        "/api/farmers/changepassword",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        },
        { withCredentials: true }
      );
      showBanner("Password changed successfully!");
      setPasswordForm(EMPTY_PASSWORD);
      setIsChangingPassword(false);
    } catch (error) {
      showBanner(error?.response?.data?.message || error.message || "Failed to change password. Check old password.");
    }
  };

  const logout = async () => {
    try {
      await apiClient.get("/api/farmers/logout", { withCredentials: true }); 
      navigation?.navigate?.("Landing"); 
    } catch (error) {
      showBanner("Logout failed.");
      navigation?.navigate?.("Landing"); 
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      "Permanently Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/api/farmers/delete", { withCredentials: true });
              navigation?.navigate?.("Landing");
            } catch (error) {
              showBanner(error?.response?.data?.message || error.message || "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const avatarUri = form.img || "https://i.ibb.co/0jqp8Qf/avatar.png"; 

  const bannerStyle = banner.toLowerCase().includes("success") ? styles.bannerSuccess : (banner ? styles.bannerError : null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Farmer Profile</Text>
          <Text style={styles.subHeading}>Manage your personal information and security settings.</Text>
        </View>

        {banner ? (
          <View style={bannerStyle}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        ) : null}

        {/* --- Profile Card: Avatar and Info/Form --- */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {isEditing && (
              <TouchableOpacity
                style={styles.avatarOverlay}
                onPress={() =>
                  Alert.alert(
                    "Image Update",
                    "This feature requires integrating a local image picker (e.g. expo-image-picker)."
                  )
                }
              >
                <Feather name="camera" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoPanel}>
            {isChangingPassword ? (
              // --- Change Password Form ---
              <>
                <Text style={styles.sectionTitle}>Change Password</Text>
                {Object.keys(EMPTY_PASSWORD).map((key, index) => (
                  <View key={key} style={styles.formGroup}>
                    <Text style={styles.label}>
                      {["Old Password", "New Password", "Confirm Password"][index]}
                    </Text>
                    <TextInput
                      style={styles.input}
                      secureTextEntry
                      value={passwordForm[key]}
                      onChangeText={(text) => handlePasswordChange(key, text)}
                      placeholder="••••••••"
                      placeholderTextColor={COLORS.muted}
                    />
                  </View>
                ))}
              </>
            ) : isEditing ? (
              // --- Edit Profile Form ---
              <>
                <Text style={styles.sectionTitle}>Edit Details</Text>
                {Object.keys(EMPTY_PROFILE).map((key) => {
                  if (key === "email" || key === "img") return null; 
                  return (
                    <View key={key} style={styles.formGroup}>
                      <Text style={styles.label}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={form[key]}
                        autoCapitalize={key === "name" ? "words" : "none"}
                        keyboardType={key === "phone" ? "phone-pad" : "default"}
                        onChangeText={(text) => handleFormChange(key, text)}
                        placeholder={`Enter ${key}`}
                        placeholderTextColor={COLORS.muted}
                      />
                    </View>
                  );
                })}
              </>
            ) : (
              // --- Display View ---
              <>
                <View style={styles.displayHeader}>
                  <View>
                    <Text style={styles.nameText}>{profile.name}</Text>
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={16} color={COLORS.primaryDark} />
                      <Text style={styles.locationText}>
                        {profile.address || "Address incomplete"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Verified</Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
  <View style={styles.infoCard}>
    <View style={styles.infoHeaderRow}>
      <Feather name="mail" size={20} color={COLORS.info} />
      <Text style={styles.infoLabel}>Email Address</Text>
    </View>
    <Text style={styles.infoValue}>{profile.email}</Text>
  </View>

  <View style={styles.infoCard}>
    <View style={styles.infoHeaderRow}>
      <Feather name="phone" size={20} color={COLORS.info} />
      <Text style={styles.infoLabel}>Contact Number</Text>
    </View>
    <Text style={styles.infoValue}>{profile.phone || "N/A"}</Text>
  </View>
</View>

              </>
            )}
          </View>
        </View>

        {/* --- Action Buttons: Edit/Save/Cancel --- */}
        <View style={styles.actionsRow}>
          {isEditing || isChangingPassword ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={isChangingPassword ? changePassword : saveProfile}
              >
                <Text style={styles.saveText}>
                  {isChangingPassword ? "Update Password" : "Save Changes"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-3" size={18} color={COLORS.primary} />
                <Text style={styles.secondaryText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsChangingPassword(true)}
              >
                <Feather name="lock" size={18} color={COLORS.primary} />
                <Text style={styles.secondaryText}>Change Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* --- Footer Actions: Logout and Delete --- */}
        <View style={styles.footerCard}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Feather name="log-out" size={20} color={COLORS.primaryDark} />
            <Text style={styles.logoutText}>Logout of Account</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
            <Feather name="trash-2" size={20} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- General Layout ---
  safeArea: {
    flex: 1,
    // IMPROVEMENT: Softer, branded background color
    backgroundColor: '#F0FFF0', 
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#F0FFF0',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.mutedDark,
  },
  // --- Header ---
  header: {
    marginTop: 16,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 15,
  },
  heading: {
    fontSize: 30, // Larger
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  subHeading: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 15,
  },
  // --- Banner ---
  banner: {
    borderRadius: RADIUS.md,
    paddingVertical: 12, // Taller banner
    paddingHorizontal: 15,
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  bannerSuccess: {
    backgroundColor: COLORS.success, // Use primary color for success banner BG
    shadowColor: COLORS.success,
  },
  bannerError: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  bannerText: {
    color: COLORS.surface, // White text for maximum contrast
    fontWeight: "700",
    fontSize: 15,
    textAlign: 'center',
  },
  // --- Profile Card ---
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 24,
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    ...SHADOWS.card,
    shadowColor: COLORS.mutedDark, // Darker shadow for more lift
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 4, // Thicker border
    borderColor: COLORS.primary,
    position: 'relative',
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoPanel: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800", // Bolder
    color: COLORS.primaryDark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 5,
  },
  // --- Display View ---
  nameText: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  locationText: {
    color: COLORS.muted,
    fontSize: 14,
    flexShrink: 1,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent,
    opacity: 0.85,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12, // More padding
    paddingVertical: 5,
    gap: 6,
  },
  activeText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14, // Slightly larger text
  },
  infoCard: {
  backgroundColor: "#F7FFF7",
  borderRadius: RADIUS.md,
  padding: 14,
  width: "100%",
  elevation: 2,
},

infoHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,   // creates spacing before value
},

infoLabel: {
  fontSize: 14,
  color: COLORS.mutedDark,
  fontWeight: "600",
},

infoValue: {
  color: COLORS.primaryDark,
  fontWeight: "700",
  fontSize: 15,
  
  marginLeft: 28, // aligns under label instead of icon
},

  // --- Form View ---
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15, // More padding
    paddingVertical: 12, // Taller input
    backgroundColor: '#F9F9F9', // Slight contrast background for inputs
    color: COLORS.mutedDark,
    fontSize: 16,
  },
  // --- Action Buttons (Save/Edit/Cancel) ---
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.pill,
    paddingVertical: 14, // Taller button
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.soft,
  },
  cancelButton: {
    backgroundColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.mutedDark,
    fontWeight: "800", // Extra bold
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveText: {
    color: COLORS.surface,
    fontWeight: "800", // Extra bold
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2, // Thicker border
    borderColor: COLORS.primary, // Primary color border
  },
  secondaryText: {
    color: COLORS.primary, 
    fontWeight: "700",
    fontSize: 15,
  },
  // --- Footer Actions (Logout/Delete) ---
  footerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20, // Increased padding
    gap: 15,
    ...SHADOWS.soft,
  },
  logoutButton: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 5,
  },
  logoutText: {
    color: COLORS.primaryDark,
    fontWeight: "700",
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 5,
  },
  deleteButton: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    paddingVertical: 5,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 16,
  },
});