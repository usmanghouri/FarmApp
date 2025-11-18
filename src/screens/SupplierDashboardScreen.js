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

// Mobile version of src/pages/SupplierDashboard.jsx
// Shows supplier stats and quick action tiles to the same logical pages
// as on the web (orders, products, weather, profile, etc.).

export default function SupplierDashboardScreen({ navigation }) {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
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

        const allOrders = ordersResponse.data?.orders || [];
        setRecentOrders(allOrders.slice(0, 3));

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = allOrders.reduce((sum, order) => {
          if (
            order.status === "delivered" &&
            new Date(order.createdAt).getMonth() === currentMonth &&
            new Date(order.createdAt).getFullYear() === currentYear
          ) {
            return sum + (order.totalPrice || 0);
          }
          return sum;
        }, 0);
        setRevenue(monthlyRevenue);

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
      <View style={styles.cardRow}>
        <StatCard label="Revenue (Month)" value={`Rs. ${revenue.toLocaleString()}`} />
        <StatCard label="Weather Status" value="Clear" subtitle="28°C - Islamabad" />
      </View>

      {/* Recent Orders Section */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <View style={styles.recentOrdersContainer}>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderItem}
              onPress={() => navigation.navigate("OrderDetail", { orderId: order._id })}
            >
              <View>
                <Text style={styles.orderId}>Order #{order._id?.slice(-6).toUpperCase()}</Text>
                <Text style={styles.orderMeta}>
                  {order.products[0]?.name || "N/A"} | Buyer: {order.userId?.slice(-6) || "N/A"}
                </Text>
              </View>
              <Text
                style={[
                  styles.orderStatus,
                  order.status === "delivered"
                    ? styles.statusDelivered
                    : order.status === "shipped"
                    ? styles.statusShipped
                    : styles.statusPending,
                ]}
              >
                {order.status}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>No recent orders found.</Text>
        )}
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
  recentOrdersContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  orderMeta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
    color: COLORS.warningDark,
  },
  statusShipped: {
    backgroundColor: COLORS.infoLight,
    color: COLORS.infoDark,
  },
  statusDelivered: {
    backgroundColor: COLORS.successLight,
    color: COLORS.successDark,
  },
  noDataText: {
    textAlign: "center",
    color: COLORS.muted,
    fontStyle: "italic",
    paddingVertical: 10,
  },
});


