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
  Image
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
  img: ""
};

const EMPTY_PASSWORD = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
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
        img: user.img || ""
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
      showBanner("Profile updated");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      showBanner(error?.response?.data?.message || error.message || "Failed to update profile");
    }
  };

  const changePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showBanner("Fill all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showBanner("Passwords do not match");
      return;
    }
    try {
      await apiClient.put(
        "/api/farmers/changepassword",
        {
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        },
        { withCredentials: true }
      );
      showBanner("Password changed");
      setPasswordForm(EMPTY_PASSWORD);
      setIsChangingPassword(false);
    } catch (error) {
      showBanner(error?.response?.data?.message || error.message || "Failed to change password");
    }
  };

  const logout = async () => {
    try {
      await apiClient.get("/api/farmers/logout", { withCredentials: true });
      navigation?.navigate?.("Landing");
    } catch (error) {
      showBanner("Logout failed");
    }
  };

  const deleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Continue?",
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
          }
        }
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Farmer Profile</Text>
          <Text style={styles.subHeading}>Manage your personal info and security</Text>
        </View>

        {banner ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        ) : null}

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            {isEditing && (
              <TouchableOpacity
                style={styles.avatarOverlay}
                onPress={() =>
                  Alert.alert(
                    "Image Upload",
                    "Hook up an image picker (e.g. expo-image-picker) to change the picture."
                  )
                }
              >
                <Feather name="camera" size={18} color={COLORS.mutedDark} />
                <Text style={styles.overlayText}>Update</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoPanel}>
            {isChangingPassword ? (
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
                    />
                  </View>
                ))}
              </>
            ) : isEditing ? (
              <>
                <Text style={styles.sectionTitle}>Edit Profile</Text>
                {Object.keys(EMPTY_PROFILE).map((key) => (
                  <View key={key} style={styles.formGroup}>
                    <Text style={styles.label}>
                      {key === "img"
                        ? "Profile Image URL"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={form[key]}
                      autoCapitalize={key === "email" ? "none" : "sentences"}
                      keyboardType={key === "phone" ? "phone-pad" : "default"}
                      editable={key !== "email"}
                      onChangeText={(text) => handleFormChange(key, text)}
                      placeholder={`Enter ${key}`}
                    />
                  </View>
                ))}
              </>
            ) : (
              <>
                <View style={styles.displayHeader}>
                  <View>
                    <Text style={styles.nameText}>{profile.name}</Text>
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={14} color={COLORS.muted} />
                      <Text style={styles.locationText}>
                        {profile.address || "Complete your address"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoCard}>
                    <Feather name="mail" size={18} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Feather name="phone" size={18} color={COLORS.primary} />
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>
                      {profile.phone || "Add phone number"}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.actionsRow}>
          {(isEditing || isChangingPassword) ? (
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
                <Feather name="edit-3" size={16} color={COLORS.info} />
                <Text style={styles.secondaryText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => setIsChangingPassword(true)}
              >
                <Feather name="lock" size={16} color={COLORS.info} />
                <Text style={styles.secondaryText}>Change Password</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.footerCard}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Feather name="log-out" size={18} color={COLORS.primaryDark} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
            <Feather name="trash-2" size={18} color={COLORS.danger} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.muted
  },
  header: {
    marginTop: 12,
    marginBottom: 16
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  subHeading: {
    marginTop: 4,
    color: COLORS.muted
  },
  banner: {
    backgroundColor: "#ecfccb",
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    ...SHADOWS.soft
  },
  bannerText: {
    color: "#3f6212",
    fontWeight: "600",
    fontSize: 13
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
    ...SHADOWS.card
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  avatar: {
    width: "100%",
    height: "100%"
  },
  avatarOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 6,
    alignItems: "center",
    gap: 4
  },
  overlayText: {
    fontSize: 10,
    color: COLORS.mutedDark,
    fontWeight: "600"
  },
  infoPanel: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.mutedDark,
    marginBottom: 10
  },
  displayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.mutedDark
  },
  locationRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 4
  },
  locationText: {
    color: COLORS.muted,
    fontSize: 13
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success
  },
  activeText: {
    color: COLORS.primaryDark,
    fontWeight: "600",
    fontSize: 12
  },
  infoGrid: {
    flexDirection: "row",
    gap: 12
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 12,
    gap: 4
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12
  },
  infoValue: {
    color: COLORS.mutedDark,
    fontWeight: "600"
  },
  formGroup: {
    marginBottom: 12
  },
  label: {
    color: COLORS.muted,
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8
  },
  cancelButton: {
    backgroundColor: COLORS.border
  },
  cancelText: {
    color: COLORS.mutedDark,
    fontWeight: "600"
  },
  saveButton: {
    backgroundColor: COLORS.primary
  },
  saveText: {
    color: "#fff",
    fontWeight: "700"
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  secondaryText: {
    color: COLORS.info,
    fontWeight: "600"
  },
  footerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 12,
    ...SHADOWS.soft
  },
  logoutButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  logoutText: {
    color: COLORS.primaryDark,
    fontWeight: "600"
  },
  deleteButton: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "600"
  }
});

