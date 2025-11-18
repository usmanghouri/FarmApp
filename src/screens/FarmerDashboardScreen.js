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
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile version of src/pages/Dashboard.jsx (Farmer Dashboard)
// Uses the same stats plus "quick action" tiles that navigate to the
// same logical destinations as the web dashboard cards + sidebar.

export default function FarmerDashboardScreen({ navigation }) {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const ordersResponse = await apiClient.get(
          "/api/v1/order/supplier-orders",
          { withCredentials: true }
        );

        const orders = ordersResponse.data?.orders || [];
        setActiveOrdersCount(ordersResponse.data?.count || orders.length);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyRevenue = orders
          .filter(
            o =>
              o.status === "delivered" &&
              new Date(o.createdAt).getMonth() === currentMonth &&
              new Date(o.createdAt).getFullYear() === currentYear
          )
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        setRevenue(monthlyRevenue);

        const productsResponse = await apiClient.get(
          "/api/products/my_product",
          { withCredentials: true }
        );
        setProductsCount(productsResponse.data?.products?.length || 0);
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
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      <Text style={styles.heading}>Farmer Dashboard</Text>

      {/* Stats cards – visually similar to the web dashboard cards */}
      <View style={styles.cardRow}>
        <StatCard label="Total Orders" value={activeOrdersCount} />
        <StatCard label="Products Listed" value={productsCount} />
      </View>
      <View style={styles.cardRow}>
        <StatCard label="Revenue (Month)" value={`₨ ${revenue.toLocaleString()}`} />
      </View>

      {/* Quick navigation tiles – mirror the sidebar/links from the web */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionTile
          label="Dashboard"
          description="Overview"
          onPress={() => navigation.navigate("FarmerDashboard")}
        />
        <ActionTile
          label="My Products"
          description="View listed products"
          onPress={() => navigation.navigate("FarmerProducts")}
        />
        <ActionTile
          label="Manage Products"
          description="Add / edit products"
          onPress={() => navigation.navigate("ProductManagement")}
        />
        <ActionTile
          label="Orders"
          description="Manage orders"
          onPress={() => navigation.navigate("OrderManagement")}
        />
        <ActionTile
          label="Cart"
          description="Shopping cart"
          onPress={() => navigation.navigate("ShoppingCart")}
        />
        <ActionTile
          label="My Orders"
          description="Order history"
          onPress={() => navigation.navigate("MyOrders")}
        />
        <ActionTile
          label="Wishlist"
          description="Saved items"
          onPress={() => navigation.navigate("Wishlist")}
        />
        <ActionTile
          label="Weather"
          description="Weather alerts"
          onPress={() => navigation.navigate("WeatherAlerts")}
        />
        <ActionTile
          label="Profile"
          description="Farmer profile"
          onPress={() => navigation.navigate("FarmerProfile")}
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
    paddingVertical: 24,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 18,
    ...SHADOWS.card,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 6,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.mutedDark,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryDark,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionTile: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.soft,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
  },
});


