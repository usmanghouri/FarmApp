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


