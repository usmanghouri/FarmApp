import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile counterpart of src/pages/OrderDetail.jsx.
// Fetch a single order by ID using the same endpoint as on the web.

export default function OrderDetailScreen() {
  const route = useRoute();
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/v1/order/single/${orderId}`, { withCredentials: true });
      setOrder(response.data.order);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError(err.response?.data?.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const formatCurrency = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString()}`;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Order Details</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Order #{order._id?.slice(-6).toUpperCase()}</Text>
          <View style={styles.statusBadge(order.status)}>
            <Text style={styles.statusBadgeText}>{order.status?.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>Order Date: {formatDate(order.createdAt)}</Text>
        <Text style={styles.amountText}>Total: {formatCurrency(order.totalPrice)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Products</Text>
        {order.products?.map((product) => (
          <View key={product._id} style={styles.productItem}>
            <Image
              source={{ uri: product.productId?.images[0] || "https://via.placeholder.com/50" }}
              style={styles.productImage}
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.productId?.name || "Product"}</Text>
              <Text style={styles.productMeta}>
                Qty: {product.quantity} • {formatCurrency(product.productId?.price)} / {product.productId?.unit}
              </Text>
            </View>
            <Text style={styles.productPrice}>{formatCurrency(product.quantity * product.productId?.price)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.addressText}>
          {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
        </Text>
        <Text style={styles.addressText}>Phone: {order.shippingAddress?.phoneNumber || "N/A"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff"
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8
  },
  text: {
    fontSize: 14,
    color: "#4b5563"
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0"
  },
  loadingText: {
    marginTop: 10,
    color: "#666"
  },
  errorText: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.small
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.medium,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.medium
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333"
  },
  statusBadge: (status) => ({
    backgroundColor: status === "completed" ? COLORS.success : status === "pending" ? COLORS.warning : COLORS.secondary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.small
  }),
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  dateText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.small,
    marginRight: 10
  },
  productInfo: {
    flex: 1,
    marginRight: 10
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333"
  },
  productMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 2
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#166534"
  },
  addressText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5
  }
});


