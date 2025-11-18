import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { apiClient, API_BASE_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile version inspired by src/components/AuthModal.jsx.
// Uses the same endpoints for Farmer / Buyer / Supplier auth.

const API_MAP = {
  Farmer: `${API_BASE_URL}/api/farmers`,
  Buyer: `${API_BASE_URL}/api/buyers`,
  Supplier: `${API_BASE_URL}/api/suppliers`
};

export default function AuthScreen({ navigation }) {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("Farmer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: ""
  });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("auth"); // auth | otp | forgot | reset
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
const [error, setError] = useState(null);

  const onChangeField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    setErrorMessage("");
    if (step === "forgot") {
      if (!formData.email) {
        setErrorMessage("Email is required");
        return false;
      }
      return true;
    }

    if (step === "reset") {
      if (!newPassword || newPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters");
        return false;
      }
      if (!otp || otp.length !== 6) {
        setErrorMessage("Please enter a valid 6-digit OTP");
        return false;
      }
      return true;
    }

    if (step === "otp") {
      if (!otp || otp.length !== 6) {
        setErrorMessage("Please enter a valid 6-digit OTP");
        return false;
      }
      return true;
    }

    if (!formData.email || !formData.password) {
      setErrorMessage("Email and password are required");
      return false;
    }
    if (isSignup && (!formData.name || !formData.phone || !formData.address)) {
      setErrorMessage("All fields are required for signup");
      return false;
    }
    return true;
  };

  const handleAuth = async () => {
    if (!validateForm()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const apiBase = API_MAP[role];
    const endpoint = isSignup ? `${apiBase}/new` : `${apiBase}/login`;
    const body = isSignup
      ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        }
      : {
          email: formData.email,
          password: formData.password
        };

    try {
      const response = await apiClient.post(endpoint, body, {
        withCredentials: true
      });

      const data = response.data || {};

      if (isSignup) {
        if (data.requiresOTP) {
          setSuccessMessage("Account created. Please verify your email with OTP.");
          setStep("otp");
        } else {
          // This case might not be reached if all signups require OTP
          setSuccessMessage("Account created successfully! Please sign in.");
          setIsSignup(false);
          setStep("auth");
        }
      } else {
        // Login success
        const roleKey =
          role === "Farmer" ? "farmers" : role === "Buyer" ? "buyers" : "suppliers";
        const profileRes = await apiClient.get(`/api/${roleKey}/me`, {
          withCredentials: true
        });
        const user = profileRes.data?.user || {};
        await login({
          role,
          user: {
            name: user.name,
            img: user.profileImage || user.img // Use profileImage if available
          }
        });
        setSuccessMessage("Signed in successfully!");
        setTimeout(() => {
          if (role === "Farmer") navigation.replace("FarmerDashboard");
          else if (role === "Buyer") navigation.replace("BuyerDashboard");
          else navigation.replace("SupplierDashboard");
        }, 1000);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Authentication failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const apiBase = API_MAP[role];
    try {
      await apiClient.post(
        `${apiBase}/forgot-password`,
        { email: formData.email },
        { withCredentials: true }
      );
      setSuccessMessage("Reset instructions sent! Check your email.");
      setStep("reset");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to send reset instructions";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const apiBase = API_MAP[role];
    try {
      await apiClient.post(
        `${apiBase}/reset-password`,
        { email: formData.email, otp, newPassword },
        { withCredentials: true }
      );
      setSuccessMessage("Password reset successfully! Please sign in.");
      setTimeout(() => {
        setStep("auth");
        setIsSignup(false);
        setFormData({ ...formData, password: "" }); // Clear password field
        setOtp("");
        setNewPassword("");
      }, 1000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to reset password";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) return;

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const apiBase = API_MAP[role];
    try {
      await apiClient.post(
        `${apiBase}/verify`,
        { email: formData.email, otp },
        { withCredentials: true }
      );
      setSuccessMessage("Email verified! Please sign in.");
      setTimeout(() => {
        setStep("auth");
        setIsSignup(false);
        setOtp("");
      }, 1000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "OTP verification failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const apiBase = API_MAP[role];
      await apiClient.post(
        `${apiBase}/resend-otp`,
        { email: formData.email },
        { withCredentials: true }
      );
      setSuccessMessage("OTP resent successfully! Check your email.");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to resend OTP";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => (
    <View style={styles.formContainer}>
      {isSignup && (
        <>
          <TextInput
            value={formData.name}
            onChangeText={v => onChangeField("name", v)}
            placeholder="Full Name"
            style={styles.input}
          />
          <TextInput
            value={formData.phone}
            onChangeText={v => onChangeField("phone", v)}
            placeholder="Phone Number"
            style={styles.input}
            keyboardType="phone-pad"
          />
          <TextInput
            value={formData.address}
            onChangeText={v => onChangeField("address", v)}
            placeholder="Address"
            style={styles.input}
          />
        </>
      )}

      <TextInput
        value={formData.email}
        onChangeText={v => onChangeField("email", v)}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        value={formData.password}
        onChangeText={v => onChangeField("password", v)}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
      />

      {!isSignup && (
        <TouchableOpacity
          onPress={() => setStep("forgot")}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>
            {isSignup ? "Create Account" : "Sign In"}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setIsSignup(s => !s);
          setError("");
          setErrorMessage("");
          setSuccessMessage("");
        }}
        style={styles.toggleRow}
      >
        <Text style={styles.toggleText}>
          {isSignup ? "Already have an account? " : "New to FarmConnect? "}
        </Text>
        <Text style={styles.toggleTextLink}>
          {isSignup ? "Sign In" : "Create Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOTPForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Verify Your Email</Text>
      <Text style={styles.formSubtitle}>
        Enter the 6-digit OTP sent to {formData.email}
      </Text>
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Verify OTP</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleResendOTP}
        style={styles.secondaryButton}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>Resend OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderForgotPasswordForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Forgot Password</Text>
      <Text style={styles.formSubtitle}>
        Enter your email to receive password reset instructions.
      </Text>
      <TextInput
        value={formData.email}
        onChangeText={v => onChangeField("email", v)}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleForgotPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResetPasswordForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Reset Password</Text>
      <Text style={styles.formSubtitle}>
        Enter the OTP from your email and your new password.
      </Text>
      <TextInput
        value={formData.email}
        onChangeText={v => onChangeField("email", v)}
        placeholder="Email (used for reset)"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        editable={false} // Email should not be editable during reset
      />
      <TextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        style={styles.input}
      />
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password (min 6 characters)"
        secureTextEntry
        style={styles.input}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitText}>Reset Password</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    switch (step) {
      case "otp":
        return renderOTPForm();
      case "forgot":
        return renderForgotPasswordForm();
      case "reset":
        return renderResetPasswordForm();
      case "auth":
      default:
        return renderAuthForm();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.heading}>FarmConnect</Text>
        <Text style={styles.subheading}>Seamless Agriculture, On-the-Go</Text>

        <View style={styles.roleRow}>
          {["Farmer", "Buyer", "Supplier"].map(r => (
            <TouchableOpacity
              key={r}
              style={[
                styles.roleChip,
                role === r && styles.roleChipActive
              ]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  role === r && styles.roleChipTextActive
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {renderContent()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    // Soft, natural gradient feel with subtle pattern
    backgroundColor: '#F0F9F0',
    // Alternative: Linear gradient background (if using expo-linear-gradient)
    // Can add: backgroundImage with subtle leaf/plant pattern overlay
  },
  
  container: {
    // Clean white surface with green accent
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    
    // Enhanced shadow for depth
    shadowColor: '#2D5016',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    
    // Subtle border with nature-inspired color
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.15)',
    
    // Optional: Add a subtle inner glow effect
    // This can be achieved with an additional inner View if needed
  },
  
  // Additional gradient overlay option (place View inside container)
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.03)',
    opacity: 0.6,
  },
  
  // Decorative accent bar (optional top accent)
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 4,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)',
    backgroundColor: '#4CAF50', // Fallback
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  roleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  roleChipText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  roleChipTextActive: {
    color: COLORS.surface,
  },
  formContainer: {
    marginTop: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    textAlign: "center",
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.mutedDark,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 13,
  },
  successText: {
    color: COLORS.success,
    textAlign: "center",
    marginBottom: 10,
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 10,
  },
  submitText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 15,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  toggleText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  toggleTextLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  secondaryButton: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: COLORS.muted,
    fontSize: 14,
  },
});


