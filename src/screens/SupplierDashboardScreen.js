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

// Mobile version of src/pages/SupplierDashboard.jsx
// Shows supplier stats and quick action tiles to the same logical pages
// as on the web (orders, products, weather, profile, etc.).

export default function SupplierDashboardScreen({ navigation }) {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
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
        setActiveOrdersCount(ordersResponse.data?.count || 0);

        const productsResponse = await apiClient.get(
          "/api/products/my_product",
          { withCredentials: true }
        );
        setProductsCount(productsResponse.data?.products?.length || 0);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Failed to load data";
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
        <Text style={styles.loadingText}>Loading supplier dashboard...</Text>
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
      <Text style={styles.heading}>Supplier Dashboard</Text>

      {/* Stats cards */}
      <View style={styles.cardRow}>
        <StatCard label="Active Orders" value={activeOrdersCount} />
        <StatCard label="Products Listed" value={productsCount} />
      </View>

      {/* Quick navigation tiles aligned with supplier web dashboard */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionTile
          label="Orders"
          description="Manage supplier orders"
          onPress={() => navigation.navigate("OrderManagement")}
        />
        <ActionTile
          label="Products"
          description="Manage products"
          onPress={() => navigation.navigate("ProductManagement")}
        />
        <ActionTile
          label="Weather"
          description="Weather alerts"
          onPress={() => navigation.navigate("WeatherAlerts")}
        />
        <ActionTile
          label="Profile"
          description="Supplier profile"
          onPress={() => navigation.navigate("SupplierProfile")}
        />
        <ActionTile
          label="Market Insights"
          description="Analytics & trends"
          onPress={() => navigation.navigate("MarketInsights")}
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


