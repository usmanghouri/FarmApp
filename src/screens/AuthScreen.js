import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { apiClient, API_BASE_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChangeField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }

    const apiBase = API_MAP[role];
    if (!apiBase) {
      setError("Invalid role selected");
      return;
    }

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

    setLoading(true);
    try {
      const response = await apiClient.post(endpoint, body, {
        // Web uses credentials: "include" cookies.
        // Here we just keep the same endpoints; cookie handling depends on backend support.
        withCredentials: true
      });

      const data = response.data || {};

      // After successful login, fetch basic profile data (same as fetchProfileData in web AuthModal)
      if (!isSignup) {
        const roleKey =
          role === "Farmer" ? "farmers" : role === "Buyer" ? "buyers" : "suppliers";
        try {
          const profileRes = await apiClient.get(`/api/${roleKey}/me`, {
            withCredentials: true
          });
          const user = profileRes.data?.user || {};
          await login({
            role,
            user: {
              name: user.name,
              img: user.img
            }
          });
        } catch {
          await login({ role, user: null });
        }

        // Navigate to dashboard based on role
        if (role === "Farmer") navigation.replace("FarmerDashboard");
        else if (role === "Buyer") navigation.replace("BuyerDashboard");
        else navigation.replace("SupplierDashboard");
      } else {
        // For signup, just show a basic confirmation and ask user to login
        setIsSignup(false);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Authentication failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{isSignup ? "Create Account" : "Sign In"}</Text>
      <Text style={styles.subheading}>Continue as</Text>

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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
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

      <TouchableOpacity onPress={() => setIsSignup(s => !s)} style={styles.toggleRow}>
        <Text style={styles.toggleText}>
          {isSignup ? "Already have an account? " : "New to FarmConnect? "}
        </Text>
        <Text style={styles.toggleTextLink}>
          {isSignup ? "Sign In" : "Create Account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#ffffff"
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 4
  },
  subheading: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16
  },
  roleRow: {
    flexDirection: "row",
    marginBottom: 24
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8
  },
  roleChipActive: {
    backgroundColor: "#16a34a",
    borderColor: "#16a34a"
  },
  roleChipText: {
    fontSize: 13,
    color: "#4b5563"
  },
  roleChipTextActive: {
    color: "#ffffff"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14
  },
  errorText: {
    color: "#b91c1c",
    marginBottom: 12
  },
  submitButton: {
    marginTop: 8,
    backgroundColor: "#16a34a",
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 12
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16
  },
  toggleText: {
    color: "#4b5563",
    fontSize: 13
  },
  toggleTextLink: {
    color: "#16a34a",
    fontSize: 13,
    fontWeight: "600"
  }
});


