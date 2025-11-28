// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   ScrollView
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { apiClient, API_BASE_URL } from "../api/client";
// import { useAuth } from "../context/AuthContext";
// import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// // Mobile version inspired by src/components/AuthModal.jsx.
// // Uses the same endpoints for Farmer / Buyer / Supplier auth.

// const API_MAP = {
//   Farmer: `${API_BASE_URL}/api/farmers`,
//   Buyer: `${API_BASE_URL}/api/buyers`,
//   Supplier: `${API_BASE_URL}/api/suppliers`
// };

// export default function AuthScreen({ navigation }) {
//   const { login } = useAuth();
//   const [isSignup, setIsSignup] = useState(false);
//   const [role, setRole] = useState("Farmer");
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     name: "",
//     phone: "",
//     address: ""
//   });
//   const [otp, setOtp] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [step, setStep] = useState("auth"); // auth | otp | forgot | reset
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
// const [error, setError] = useState(null);
// const [showPassword, setShowPassword] = useState(false);

//   const onChangeField = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const validateForm = () => {
//     setErrorMessage("");
//     if (step === "forgot") {
//       if (!formData.email) {
//         setErrorMessage("Email is required");
//         return false;
//       }
//       return true;
//     }

//     if (step === "reset") {
//       if (!newPassword || newPassword.length < 6) {
//         setErrorMessage("Password must be at least 8 characters");
//         return false;
//       }
//       if (!otp || otp.length !== 6) {
//         setErrorMessage("Please enter a valid 6-digit OTP");
//         return false;
//       }
//       return true;
//     }

//     if (step === "otp") {
//       if (!otp || otp.length !== 6) {
//         setErrorMessage("Please enter a valid 6-digit OTP");
//         return false;
//       }
//       return true;
//     }

//     if (!formData.email || !formData.password) {
//       setErrorMessage("Email and password are required");
//       return false;
//     }
//     if (isSignup && (!formData.name || !formData.phone || !formData.address)) {
//       setErrorMessage("All fields are required for signup");
//       return false;
//     }
//     return true;
//   };

//   const handleAuth = async () => {
//     if (!validateForm()) return;

//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     const apiBase = API_MAP[role];
//     const endpoint = isSignup ? `${apiBase}/new` : `${apiBase}/login`;
//     const body = isSignup
//       ? {
//           name: formData.name,
//           email: formData.email,
//           password: formData.password,
//           phone: formData.phone,
//           address: formData.address
//         }
//       : {
//           email: formData.email,
//           password: formData.password
//         };

//     try {
//       const response = await apiClient.post(endpoint, body, {
//         withCredentials: true
//       });

//       const data = response.data || {};

//       if (isSignup) {
//         // Always require email verification after signup (matching web version)
//         setSuccessMessage("✅ Registered successfully! Please verify your email.");
//         setStep("otp");
//       } else {
//         // Login success
//         const roleKey =
//           role === "Farmer" ? "farmers" : role === "Buyer" ? "buyers" : "suppliers";
//         const profileRes = await apiClient.get(`/api/${roleKey}/me`, {
//           withCredentials: true
//         });
//         const user = profileRes.data?.user || {};
//         await login({
//           role,
//           user: {
//             name: user.name,
//             img: user.profileImage || user.img // Use profileImage if available
//           }
//         });
//         setSuccessMessage("Signed in successfully!");
//         setTimeout(() => {
//           if (role === "Farmer") navigation.replace("FarmerDashboard");
//           else if (role === "Buyer") navigation.replace("BuyerDashboard");
//           else navigation.replace("SupplierDashboard");
//         }, 1000);
//       }
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err.message || "Authentication failed";
//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!validateForm()) return;

//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     const apiBase = API_MAP[role];
//     try {
//       await apiClient.post(
//         `${apiBase}/forgot-password`,
//         { email: formData.email },
//         { withCredentials: true }
//       );
//       setSuccessMessage("Reset instructions sent! Check your email.");
//       setStep("reset");
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err.message || "Failed to send reset instructions";
//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResetPassword = async () => {
//     if (!validateForm()) return;

//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     const apiBase = API_MAP[role];
//     try {
//       await apiClient.post(
//         `${apiBase}/reset-password`,
//         { email: formData.email, otp, newPassword },
//         { withCredentials: true }
//       );
//       setSuccessMessage("Password reset successfully! Please sign in.");
//       setTimeout(() => {
//         setStep("auth");
//         setIsSignup(false);
//         setFormData({ ...formData, password: "" }); // Clear password field
//         setOtp("");
//         setNewPassword("");
//       }, 1000);
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err.message || "Failed to reset password";
//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async () => {
//     if (!validateForm()) return;

//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);

//     const apiBase = API_MAP[role];
//     try {
//       await apiClient.post(
//         `${apiBase}/verify`,
//         { email: formData.email, otp },
//         { withCredentials: true }
//       );
//       setSuccessMessage("✅ Email verified! Please log in.");
//       setTimeout(() => {
//         setStep("auth");
//         setIsSignup(false);
//         setOtp("");
//         setFormData({ ...formData, password: "" }); // Clear password field
//       }, 1500);
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message || err.message || "OTP verification failed";
//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResendOTP = async () => {
//     setErrorMessage("");
//     setSuccessMessage("");
//     setLoading(true);
//     try {
//       const apiBase = API_MAP[role];
//       // Try both endpoint formats to match web version
//       try {
//         await apiClient.post(
//           `${apiBase}/resendOTP`,
//           { email: formData.email },
//           { withCredentials: true }
//         );
//         setSuccessMessage("📨 OTP resent to your email.");
//       } catch (err) {
//         // Fallback to alternative endpoint format
//         await apiClient.post(
//           `${apiBase}/resend-otp`,
//           { email: formData.email },
//           { withCredentials: true }
//         );
//         setSuccessMessage("📨 OTP resent to your email.");
//       }
//     } catch (err) {
//       const msg = err?.response?.data?.message || err.message || "Failed to resend OTP";
//       setErrorMessage(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderAuthForm = () => (
//     <View style={styles.formContainer}>
//       {isSignup && (
//         <>
//           <TextInput
//             value={formData.name}
//             onChangeText={v => onChangeField("name", v)}
//             placeholder="Full Name"
//             style={styles.input}
//           />
//           <TextInput
//             value={formData.phone}
//             onChangeText={v => onChangeField("phone", v)}
//             placeholder="+923xxxxxxxxx"
//             style={styles.input}
//             keyboardType="phone-pad"
//           />
//           <TextInput
//             value={formData.address}
//             onChangeText={v => onChangeField("address", v)}
//             placeholder="Address"
//             style={styles.input}
//           />
//         </>
//       )}

//       <TextInput
//         value={formData.email}
//         onChangeText={v => onChangeField("email", v)}
//         placeholder="Email"
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={styles.input}
//       />

//       {/* <TextInput
//         value={formData.password}
//         onChangeText={v => onChangeField("password", v)}
//         placeholder="Password"
//         secureTextEntry
//         style={styles.input}
//       /> */}
//       {/* 3. UPDATED PASSWORD FIELD WITH ICON */}
//       <View style={styles.passwordContainer}>
//         <TextInput
//           value={formData.password}
//           onChangeText={v => onChangeField("password", v)}
//           placeholder="Password"
//           secureTextEntry={!showPassword} 
//           style={styles.passwordInput}
//         />
//         <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons 
//             name={showPassword ? "eye-off" : "eye"} 
//             size={24} 
//             color={COLORS.muted} 
//           />
//         </TouchableOpacity>
//       </View>

//       {!isSignup && (
//         <TouchableOpacity
//           onPress={() => setStep("forgot")}
//           style={styles.forgotPasswordButton}
//         >
//           <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//         </TouchableOpacity>
//       )}

//       {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
//       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleAuth}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#ffffff" />
//         ) : (
//           <Text style={styles.submitText}>
//             {isSignup ? "Create Account" : "Sign In"}
//           </Text>
//         )}
//       </TouchableOpacity>

//       <TouchableOpacity
//         onPress={() => {
//           setIsSignup(s => !s);
//           setError("");
//           setErrorMessage("");
//           setSuccessMessage("");
//         }}
//         style={styles.toggleRow}
//       >
//         <Text style={styles.toggleText}>
//           {isSignup ? "Already have an account? " : "New to FarmConnect? "}
//         </Text>
//         <Text style={styles.toggleTextLink}>
//           {isSignup ? "Sign In" : "Create Account"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderOTPForm = () => (
//     <View style={styles.formContainer}>
//       <Text style={styles.formTitle}>Verify Your Email</Text>
//       <Text style={styles.formSubtitle}>
//         We've sent a 6-digit code to {formData.email}
//       </Text>
//       <TextInput
//         value={otp}
//         onChangeText={(text) => {
//           // Only allow numeric input
//           const numericText = text.replace(/[^0-9]/g, '');
//           setOtp(numericText);
//         }}
//         placeholder="Enter 6-digit OTP"
//         keyboardType="number-pad"
//         maxLength={6}
//         style={styles.input}
//         autoFocus={true}
//       />
//       {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
//       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleVerifyOTP}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#ffffff" />
//         ) : (
//           <Text style={styles.submitText}>Verify OTP</Text>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity
//         onPress={handleResendOTP}
//         style={styles.secondaryButton}
//         disabled={loading}
//       >
//         <Text style={styles.secondaryButtonText}>Resend OTP</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
//         <Text style={styles.backButtonText}>Back to Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderForgotPasswordForm = () => (
//     <View style={styles.formContainer}>
//       <Text style={styles.formTitle}>Forgot Password</Text>
//       <Text style={styles.formSubtitle}>
//         Enter your email to receive password reset instructions.
//       </Text>
//       <TextInput
//         value={formData.email}
//         onChangeText={v => onChangeField("email", v)}
//         placeholder="Email"
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={styles.input}
//       />
//       {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
//       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleForgotPassword}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#ffffff" />
//         ) : (
//           <Text style={styles.submitText}>Send Reset Link</Text>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
//         <Text style={styles.backButtonText}>Back to Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderResetPasswordForm = () => (
//     <View style={styles.formContainer}>
//       <Text style={styles.formTitle}>Reset Password</Text>
//       <Text style={styles.formSubtitle}>
//         Enter the OTP from your email and your new password.
//       </Text>
//       <TextInput
//         value={formData.email}
//         onChangeText={v => onChangeField("email", v)}
//         placeholder="Email (used for reset)"
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={styles.input}
//         editable={false} // Email should not be editable during reset
//       />
//       <TextInput
//         value={otp}
//         onChangeText={setOtp}
//         placeholder="Enter OTP"
//         keyboardType="number-pad"
//         maxLength={6}
//         style={styles.input}
//       />
//       {/* <TextInput
//         value={newPassword}
//         onChangeText={setNewPassword}
//         placeholder="New Password (min 6 characters)"
//         secureTextEntry
//         style={styles.input}
//       /> */}
//       {/* Updated Reset Password Field with Icon logic as well */}
//       <View style={styles.passwordContainer}>
//         <TextInput
//           value={newPassword}
//           onChangeText={setNewPassword}
//           placeholder="New Password (min 6 characters)"
//           secureTextEntry={!showPassword}
//           style={styles.passwordInput}
//         />
//          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//           <Ionicons 
//             name={showPassword ? "eye-off" : "eye"} 
//             size={24} 
//             color={COLORS.muted} 
//           />
//         </TouchableOpacity>
//       </View>
//       {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
//       {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleResetPassword}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#ffffff" />
//         ) : (
//           <Text style={styles.submitText}>Reset Password</Text>
//         )}
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => setStep("auth")} style={styles.backButton}>
//         <Text style={styles.backButtonText}>Back to Sign In</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderContent = () => {
//     switch (step) {
//       case "otp":
//         return renderOTPForm();
//       case "forgot":
//         return renderForgotPasswordForm();
//       case "reset":
//         return renderResetPasswordForm();
//       case "auth":
//       default:
//         return renderAuthForm();
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.container}>
//         <Text style={styles.heading}>FarmConnect</Text>
//         <Text style={styles.subheading}>Seamless Agriculture, On-the-Go</Text>

//         <View style={styles.roleRow}>
//           {["Farmer", "Buyer", "Supplier"].map(r => (
//             <TouchableOpacity
//               key={r}
//               style={[
//                 styles.roleChip,
//                 role === r && styles.roleChipActive
//               ]}
//               onPress={() => setRole(r)}
//             >
//               <Text
//                 style={[
//                   styles.roleChipText,
//                   role === r && styles.roleChipTextActive
//                 ]}
//               >
//                 {r}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         {renderContent()}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: "center",
//     paddingVertical: 20,
//     // Soft, natural gradient feel with subtle pattern
//     backgroundColor: '#F0F9F0',
//     // Alternative: Linear gradient background (if using expo-linear-gradient)
//     // Can add: backgroundImage with subtle leaf/plant pattern overlay
//   },
  
//   container: {
//     // Clean white surface with green accent
//     backgroundColor: '#FFFFFF',
//     borderRadius: 24,
//     marginHorizontal: 20,
//     padding: 24,
    
//     // Enhanced shadow for depth
//     shadowColor: '#2D5016',
//     shadowOffset: {
//       width: 0,
//       height: 8,
//     },
//     shadowOpacity: 0.12,
//     shadowRadius: 16,
//     elevation: 10,
    
//     // Subtle border with nature-inspired color
//     borderWidth: 1.5,
//     borderColor: 'rgba(76, 175, 80, 0.15)',
    
//     // Optional: Add a subtle inner glow effect
//     // This can be achieved with an additional inner View if needed
//   },
  
//   // Additional gradient overlay option (place View inside container)
//   gradientOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 120,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     backgroundColor: 'rgba(76, 175, 80, 0.03)',
//     opacity: 0.6,
//   },
  
//   // Decorative accent bar (optional top accent)
//   accentBar: {
//     position: 'absolute',
//     top: 0,
//     left: 24,
//     right: 24,
//     height: 4,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     background: 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 50%, #81C784 100%)',
//     backgroundColor: '#4CAF50', // Fallback
//   },
//   heading: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: COLORS.primaryDark,
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     color: COLORS.muted,
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   roleRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 24,
//   },
//   roleChip: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: RADIUS.pill,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     marginHorizontal: 4,
//   },
//   roleChipActive: {
//     backgroundColor: COLORS.primary,
//     borderColor: COLORS.primary,
//   },
//   roleChipText: {
//     fontSize: 14,
//     color: COLORS.mutedDark,
//     fontWeight: "600",
//   },
//   roleChipTextActive: {
//     color: COLORS.surface,
//   },
//   formContainer: {
//     marginTop: 10,
//   },
//   formTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: COLORS.primaryDark,
//     textAlign: "center",
//     marginBottom: 10,
//   },
//   formSubtitle: {
//     fontSize: 14,
//     color: COLORS.muted,
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     marginBottom: 15,
//     fontSize: 16,
//     color: COLORS.mutedDark,
//     backgroundColor: COLORS.background,
//   },
//   errorText: {
//     color: COLORS.danger,
//     textAlign: "center",
//     marginBottom: 10,
//     fontSize: 13,
//   },
//   successText: {
//     color: COLORS.success,
//     textAlign: "center",
//     marginBottom: 10,
//     fontSize: 13,
//   },
//   submitButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: RADIUS.pill,
//     alignItems: "center",
//     paddingVertical: 14,
//     marginTop: 10,
//   },
//   submitText: {
//     color: COLORS.surface,
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   forgotPasswordButton: {
//     alignSelf: "flex-end",
//     marginBottom: 15,
//   },
//   forgotPasswordText: {
//     color: COLORS.primary,
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   toggleRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   toggleText: {
//     color: COLORS.muted,
//     fontSize: 14,
//   },
//   toggleTextLink: {
//     color: COLORS.primary,
//     fontSize: 14,
//     fontWeight: "bold",
//     marginLeft: 5,
//   },
//   secondaryButton: {
//     borderColor: COLORS.primary,
//     borderWidth: 1,
//     borderRadius: RADIUS.pill,
//     alignItems: "center",
//     paddingVertical: 12,
//     marginTop: 10,
//   },
//   secondaryButtonText: {
//     color: COLORS.primary,
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   backButton: {
//     alignSelf: "center",
//     marginTop: 20,
//   },
//   backButtonText: {
//     color: COLORS.muted,
//     fontSize: 14,
//   },
//   // 4. NEW STYLES FOR PASSWORD CONTAINER
//   passwordContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     borderRadius: RADIUS.md,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     backgroundColor: COLORS.background,
//   },
//   passwordInput: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//     color: COLORS.mutedDark,
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiClient, API_BASE_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";
// Assuming these are defined in your styles/theme.js
const COLORS = {
  primary: "#4CAF50",
  primaryDark: "#2D5016",
  muted: "#757575",
  mutedDark: "#424242",
  surface: "#FFFFFF",
  background: "#F5F5F5",
  border: "#E0E0E0",
  danger: "#EF5350",
  success: "#66BB6A",
};
const RADIUS = {
  md: 8,
  pill: 20,
};
// const { COLORS, SHADOWS, RADIUS } = require('../styles/theme'); // Adjust import as per your project structure

// REGEX Definitions (Copied from AuthModal.jsx)
const NAME_REGEX = /^[a-zA-Z\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\-_.+])[A-Za-z\d@$!%*?&#\-_.+]{8,}$/;
const PHONE_REGEX = /^\+92\d{10}$/; // Adjusted to only validate the format, not presence
const OTP_REGEX = /^\d{6}$/;

const API_MAP = {
  Farmer: `${API_BASE_URL}/api/farmers`,
  Buyer: `${API_BASE_URL}/api/buyers`,
  Supplier: `${API_BASE_URL}/api/suppliers`,
};

// --- Helper Functions ---

const getPasswordChecklist = (value = "") => ({
  length: value.length >= 8,
  lower: /[a-z]/.test(value),
  upper: /[A-Z]/.test(value),
  digit: /\d/.test(value),
  special: /[@$!%*?&#\-_.+]/.test(value),
});

const InlineError = ({ message }) =>
  message ? <Text style={styles.inlineErrorText}>{message}</Text> : null;

// --- New Component: Password Checklist ---
const PasswordChecklist = ({ password = "" }) => {
  const checklist = getPasswordChecklist(password);
  const items = [
    { key: "length", label: "At least 8 characters" },
    { key: "lower", label: "Includes a lowercase letter" },
    { key: "upper", label: "Includes an uppercase letter" },
    { key: "digit", label: "Includes a number" },
    { key: "special", label: "Includes @$!%*?&#-_.+" },
  ];

  return (
    <View style={styles.checklistContainer}>
      {items.map(({ key, label }) => (
        <View key={key} style={styles.checklistItem}>
          <Ionicons
            name={checklist[key] ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={checklist[key] ? COLORS.success : COLORS.muted}
            style={styles.checklistIcon}
          />
          <Text
            style={[
              styles.checklistText,
              { color: checklist[key] ? COLORS.success : COLORS.mutedDark },
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
};
// --- End Helper Functions ---

export default function AuthScreen({ navigation }) {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState("Farmer");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
  });
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState("auth"); // auth | otp | forgot | reset
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // New state for inline errors
  const [showPassword, setShowPassword] = useState(false);

  const clearFormFeedback = () => {
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({}); // Clear field errors too
  };

  // 1. UPDATED VALIDATION LOGIC
  const validateField = (field, value, options = {}) => {
    const targetField = options.aliasFor || field;
    const rawValue = typeof value === "string" ? value : value ?? "";
    const trimmedValue =
      typeof rawValue === "string" ? rawValue.trim() : rawValue;

    switch (targetField) {
      case "name":
        if (!trimmedValue) return "Full Name is required";
        if (!NAME_REGEX.test(trimmedValue))
          return "Name can only include letters and spaces";
        return "";
      case "email":
        if (!trimmedValue) return "Email is required";
        if (!EMAIL_REGEX.test(trimmedValue))
          return "Enter a valid email address";
        return "";
      case "password":
        if (!rawValue) return "Password is required";
        if (options.enforceComplexity && !PASSWORD_REGEX.test(rawValue))
          return "Password does not meet complexity requirements";
        return "";
      case "phone":
        if (!trimmedValue) return "Phone number is required";
        if (!PHONE_REGEX.test(trimmedValue))
          return "Phone must match +92XXXXXXXXXX format";
        return "";
      case "address":
        if (!trimmedValue) return "Address is required";
        return "";
      case "otp":
        if (!trimmedValue) return "OTP is required";
        if (!OTP_REGEX.test(trimmedValue))
          return "Enter a valid 6-digit OTP";
        return "";
      default:
        return "";
    }
  };

  const runValidationForField = (field, value, options = {}) => {
    const message = validateField(field, value, options);
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
    return !message;
  };

  const onChangeField = (field, value) => {
    clearFormFeedback(); // Clear error/success on any input change
    setFormData((prev) => ({ ...prev, [field]: value }));
    const validationOptions =
      field === "password" ? { enforceComplexity: isSignup } : undefined;
    runValidationForField(field, value, validationOptions);
  };

  const onChangeOTP = (value) => {
    clearFormFeedback();
    const numericText = value.replace(/[^0-9]/g, "");
    setOtp(numericText);
    runValidationForField("otp", numericText);
  };

  const onChangeNewPassword = (value) => {
    clearFormFeedback();
    setNewPassword(value);
    runValidationForField("newPassword", value, {
      enforceComplexity: true,
      aliasFor: "password",
    });
  };

  // 2. UPDATED MASTER VALIDATION FUNCTION (replaces original `validateForm`)
  const validateCurrentStep = () => {
    clearFormFeedback();
    let isValid = true;

    if (step === "forgot") {
      isValid = runValidationForField("email", formData.email);
    } else if (step === "reset") {
      isValid =
        runValidationForField("otp", otp) &&
        runValidationForField("newPassword", newPassword, {
          enforceComplexity: true,
          aliasFor: "password",
        });
    } else if (step === "otp") {
      isValid = runValidationForField("otp", otp);
    } else if (step === "auth") {
      // Login/Signup
      isValid =
        runValidationForField("email", formData.email) &&
        runValidationForField("password", formData.password, {
          enforceComplexity: isSignup, // Enforce complexity only for signup
        });

      if (isSignup && isValid) {
        // Run additional signup validations
        const signupFields = ["name", "phone", "address"];
        for (const field of signupFields) {
          if (!runValidationForField(field, formData[field])) {
            isValid = false;
          }
        }
      }
    }

    // Set a general error message if field-specific validation fails
    if (!isValid) {
      setErrorMessage("Please correct the errors in the form.");
    }
    return isValid;
  };

  const handleAuth = async () => {
    if (!validateCurrentStep()) return;

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
          address: formData.address,
        }
      : {
          email: formData.email,
          password: formData.password,
        };

    try {
      const response = await apiClient.post(endpoint, body, {
        withCredentials: true,
      });

      // const data = response.data || {}; // Not used in RN version

      if (isSignup) {
        setSuccessMessage("✅ Registered successfully! Please verify your email.");
        setStep("otp");
      } else {
        // Login success
        const roleKey =
          role === "Farmer" ? "farmers" : role === "Buyer" ? "buyers" : "suppliers";
        const profileRes = await apiClient.get(`/api/${roleKey}/me`, {
          withCredentials: true,
        });
        const user = profileRes.data?.user || {};
        await login({
          role,
          user: {
            name: user.name,
            img: user.profileImage || user.img, // Use profileImage if available
          },
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
    if (!validateCurrentStep()) return;

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
    if (!validateCurrentStep()) return;

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
    if (!validateCurrentStep()) return;

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
      setSuccessMessage("✅ Email verified! Please log in.");
      setTimeout(() => {
        setStep("auth");
        setIsSignup(false);
        setOtp("");
        setFormData({ ...formData, password: "" }); // Clear password field
      }, 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "OTP verification failed";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // Only validate email for resend
    if (!runValidationForField("email", formData.email)) {
      setErrorMessage(validateField("email", formData.email) || "Enter the email used for verification.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);
    try {
      const apiBase = API_MAP[role];
      // Try both endpoint formats to match web version
      try {
        await apiClient.post(
          `${apiBase}/resendOTP`,
          { email: formData.email },
          { withCredentials: true }
        );
        setSuccessMessage("📨 OTP resent to your email.");
      } catch (err) {
        // Fallback to alternative endpoint format
        await apiClient.post(
          `${apiBase}/resend-otp`,
          { email: formData.email },
          { withCredentials: true }
        );
        setSuccessMessage("📨 OTP resent to your email.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to resend OTP";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => (
    <View style={styles.formContainer}>
      {/* Name, Phone, Address (Signup only) */}
      {isSignup && (
        <>
          <TextInput
            value={formData.name}
            onChangeText={v => onChangeField("name", v)}
            placeholder="Full Name"
            style={[styles.input, fieldErrors.name && styles.inputError]}
          />
          <InlineError message={fieldErrors.name} />
          
          <TextInput
            value={formData.phone}
            onChangeText={v => onChangeField("phone", v)}
            placeholder="Phone Number (+92XXXXXXXXXX)"
            style={[styles.input, fieldErrors.phone && styles.inputError]}
            keyboardType="phone-pad"
          />
          <InlineError message={fieldErrors.phone} />

          <TextInput
            value={formData.address}
            onChangeText={v => onChangeField("address", v)}
            placeholder="Address"
            style={[styles.input, fieldErrors.address && styles.inputError]}
          />
          <InlineError message={fieldErrors.address} />
        </>
      )}

      {/* Email */}
      <TextInput
        value={formData.email}
        onChangeText={v => onChangeField("email", v)}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, fieldErrors.email && styles.inputError]}
      />
      <InlineError message={fieldErrors.email} />

      {/* Password with Eye Icon */}
      <View style={[styles.passwordContainer, fieldErrors.password && styles.inputErrorContainer]}>
        <TextInput
          value={formData.password}
          onChangeText={v => onChangeField("password", v)}
          placeholder="Password"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={COLORS.muted}
          />
        </TouchableOpacity>
      </View>
      <InlineError message={fieldErrors.password} />
      
      {/* Password Checklist (Signup only) */}
      {isSignup && <PasswordChecklist password={formData.password} />}

      {!isSignup && (
        <TouchableOpacity
          onPress={() => {
            setStep("forgot");
            setFieldErrors({}); // Clear field errors on step change
          }}
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
          setFormData({ ...formData, password: "" }); // Clear password on toggle
          clearFormFeedback(); // Clear all messages/errors
          setFieldErrors({});
          setShowPassword(false);
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
        We've sent a 6-digit code to {formData.email}
      </Text>
      <TextInput
        value={otp}
        onChangeText={onChangeOTP} // Use new change handler
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        style={[styles.input, fieldErrors.otp && styles.inputError]}
        autoFocus={true}
      />
      <InlineError message={fieldErrors.otp} />
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
      <TouchableOpacity
        onPress={() => {
          setStep("auth");
          clearFormFeedback();
          setOtp(""); // Clear OTP on back
        }}
        style={styles.backButton}
      >
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
        style={[styles.input, fieldErrors.email && styles.inputError]}
      />
      <InlineError message={fieldErrors.email} />
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
      <TouchableOpacity
        onPress={() => {
          setStep("auth");
          clearFormFeedback();
        }}
        style={styles.backButton}
      >
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
        style={[styles.input, fieldErrors.email && styles.inputError]}
        editable={false} // Email should not be editable during reset
      />
      <InlineError message={fieldErrors.email} />
      
      {/* OTP Input */}
      <TextInput
        value={otp}
        onChangeText={onChangeOTP} // Use new change handler
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        style={[styles.input, fieldErrors.otp && styles.inputError]}
      />
      <InlineError message={fieldErrors.otp} />

      {/* New Password Input with Eye Icon */}
      <View style={[styles.passwordContainer, fieldErrors.newPassword && styles.inputErrorContainer]}>
        <TextInput
          value={newPassword}
          onChangeText={onChangeNewPassword} // Use new change handler
          placeholder="New Password (min 8 characters)"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={COLORS.muted}
          />
        </TouchableOpacity>
      </View>
      <InlineError message={fieldErrors.newPassword} />
      
      {/* Password Checklist (Reset Password) */}
      <PasswordChecklist password={newPassword} />

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
      <TouchableOpacity
        onPress={() => {
          setStep("auth");
          clearFormFeedback();
          setOtp(""); // Clear on back
          setNewPassword(""); // Clear on back
        }}
        style={styles.backButton}
      >
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
              onPress={() => {
                setRole(r);
                clearFormFeedback();
                setFormData({...formData, password: ""}); // Clear password on role change
              }}
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
    backgroundColor: '#F0F9F0',
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    shadowColor: '#2D5016',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 175, 80, 0.15)',
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
  // NEW STYLE: Input error border
  inputError: {
    borderColor: COLORS.danger,
    marginBottom: 5, // Reduce margin when error is present
  },
  // NEW STYLE: Container error border (for password field)
  inputErrorContainer: {
    borderColor: COLORS.danger,
  },
  // NEW STYLE: Inline Error Text
  inlineErrorText: {
    color: COLORS.danger,
    marginBottom: 10,
    fontSize: 12,
    paddingLeft: 5,
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
  // Styles for password container
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: COLORS.background,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.mutedDark,
  },
  // NEW STYLES for PasswordChecklist
  checklistContainer: {
    marginBottom: 15,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  checklistIcon: {
    marginRight: 5,
  },
  checklistText: {
    fontSize: 13,
  },
});