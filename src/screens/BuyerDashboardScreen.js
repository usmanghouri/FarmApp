import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { apiClient } from "../api/client";

// Mobile version of src/pages/BuyerDashboard.jsx
// Shows key stats and quick navigation tiles to the same destinations
// as the web dashboard cards and links.

export default function BuyerDashboardScreen({ navigation }) {
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const ordersRes = await apiClient.get(
          "/api/v1/order/user-orders",
          { withCredentials: true }
        );
        setOrdersCount(ordersRes.data?.orders?.length || 0);

        const wishlistRes = await apiClient.get(
          "/api/wishlist/my-wishlist",
          { withCredentials: true }
        );
        setWishlistCount(wishlistRes.data?.wishlist?.length || 0);

        const cartRes = await apiClient.get(
          "/api/cart/my-cart",
          { withCredentials: true }
        );
        setCartCount(cartRes.data?.cart?.items?.length || 0);
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to load data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading buyer dashboard...</Text>
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
      <Text style={styles.heading}>Buyer Dashboard</Text>

      {/* Stats cards */}
      <View style={styles.cardRow}>
        <StatCard label="My Orders" value={ordersCount} />
        <StatCard label="Wishlist" value={wishlistCount} />
      </View>
      <View style={styles.cardRow}>
        <StatCard label="Cart Items" value={cartCount} />
      </View>

      {/* Quick navigation tiles mirroring the web buyer dashboard */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionTile
          label="Browse Products"
          description="View marketplace"
          onPress={() => navigation.navigate("BuyerProducts")}
        />
        <ActionTile
          label="My Cart"
          description="Checkout items"
          onPress={() => navigation.navigate("BuyerCart")}
        />
        <ActionTile
          label="My Orders"
          description="Order history"
          onPress={() => navigation.navigate("MyOrders")}
        />
        <ActionTile
          label="Wishlist"
          description="Saved products"
          onPress={() => navigation.navigate("Wishlist")}
        />
        <ActionTile
          label="Profile"
          description="Buyer profile"
          onPress={() => navigation.navigate("BuyerProfile")}
        />
      </View>
    </ScrollView>
  );
}

const StatCard = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const ActionTile = ({ label, description, onPress }) => (
  <TouchableOpacity style={styles.actionTile} onPress={onPress}>
    <Text style={styles.actionLabel}>{label}</Text>
    {description ? <Text style={styles.actionDescription}>{description}</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 16
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  card: {
    flex: 1,
    backgroundColor: "#ecfdf3",
    borderRadius: 12,
    padding: 16,
    marginRight: 8
  },
  cardLabel: {
    fontSize: 13,
    color: "#4b5563",
    marginBottom: 4
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534"
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  loadingText: {
    marginTop: 8,
    color: "#4b5563"
  },
  errorText: {
    color: "#b91c1c",
    textAlign: "center"
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#166534"
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  actionTile: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginRight: "4%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4
  },
  actionDescription: {
    fontSize: 12,
    color: "#6b7280"
  }
});


