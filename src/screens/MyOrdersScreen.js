import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// APIs: GET /api/v1/order/user-orders, PUT /api/v1/order/cancel/:id, POST /api/review/add

const emptyReview = {
  productId: null,
  productName: "",
  rating: 0,
  comment: ""
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [reviewForm, setReviewForm] = useState(emptyReview);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(
        "/api/v1/order/user-orders",
        { withCredentials: true }
      );
      setOrders(res.data?.orders || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const formatCurrency = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString()}`;

  const cancelOrder = async (orderId) => {
    try {
      setActionMessage("");
      await apiClient.put(
        `/api/v1/order/cancel/${orderId}`,
        {},
        { withCredentials: true }
      );
      setActionMessage("Order cancelled");
      fetchOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to cancel order";
      setActionMessage(msg);
    }
  };

  const openReview = (product) => {
    setReviewForm({
      productId: product.productId?._id,
      productName: product.productId?.name || "Product",
      rating: 0,
      comment: ""
    });
  };

  const submitReview = async () => {
    if (!reviewForm.productId || reviewForm.rating === 0 || !reviewForm.comment.trim()) {
      setActionMessage("Select rating and add a comment");
      return;
    }
    try {
      setActionMessage("");
      await apiClient.post(
        "/api/review/add",
        {
          productId: reviewForm.productId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        },
        { withCredentials: true }
      );
      setActionMessage("Review submitted");
      setReviewForm(emptyReview);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to submit review";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Orders</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation?.navigate?.("FarmerProducts")}
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>
                  Order #{item._id?.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.statusBadge(item.status)}>
                <Text style={styles.statusBadgeText}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.amountText}>{formatCurrency(item.totalPrice)}</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items</Text>
              {item.products?.map((product) => (
                <View key={product._id} style={styles.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>
                      {product.productId?.name || "Product"}
                    </Text>
                    <Text style={styles.productMeta}>
                      Qty: {product.quantity} • {formatCurrency(product.productId?.price)} /{" "}
                      {product.productId?.unit}
                    </Text>
                  </View>
                  {item.status === "delivered" && (
                    <TouchableOpacity
                      style={styles.reviewButton}
                      onPress={() => openReview(product)}
                    >
                      <Text style={styles.reviewButtonText}>Review</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping</Text>
              <Text style={styles.sectionText}>
                {item.shippingAddress?.street}, {item.shippingAddress?.city},{" "}
                {item.shippingAddress?.zipCode}
              </Text>
              <Text style={styles.sectionText}>
                Phone: {item.shippingAddress?.phoneNumber || "N/A"}
              </Text>
            </View>

            {(item.status === "pending" || item.status === "processing") && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelOrder(item._id)}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Place your first order to see it here.
            </Text>
          </View>
        }
      />

      {reviewForm.productId && (
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>
              Review {reviewForm.productName}
            </Text>
            <TouchableOpacity onPress={() => setReviewForm(emptyReview)}>
              <Text style={styles.cancelReviewText}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
              >
                <Text style={reviewForm.rating >= star ? styles.starActive : styles.star}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            multiline
            value={reviewForm.comment}
            onChangeText={(t) => setReviewForm((prev) => ({ ...prev, comment: t }))}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={submitReview}>
            <Text style={styles.primaryButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  primaryButton: {
    backgroundColor: "#166534",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  actionMessage: {
    fontSize: 12,
    color: "#16a34a",
    marginBottom: 8
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827"
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280"
  },
  statusBadge: (status) => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor:
      status === "delivered"
        ? "#dcfce7"
        : status === "canceled"
        ? "#fee2e2"
        : "#fef3c7"
  }),
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#166534"
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8
  },
  section: {
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4
  },
  sectionText: {
    fontSize: 12,
    color: "#6b7280"
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827"
  },
  productMeta: {
    fontSize: 12,
    color: "#6b7280"
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3b82f6"
  },
  reviewButtonText: {
    color: "#2563eb",
    fontWeight: "600"
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fee2e2"
  },
  cancelButtonText: {
    color: "#b91c1c",
    fontWeight: "600"
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center"
  },
  reviewCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  cancelReviewText: {
    color: "#b91c1c",
    fontWeight: "600"
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 8
  },
  star: {
    fontSize: 24,
    color: "#d1d5db",
    marginRight: 6
  },
  starActive: {
    fontSize: 24,
    color: "#facc15",
    marginRight: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff"
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
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#b91c1c",
    marginBottom: 6
  },
  errorText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 10
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#166534"
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600"
  }
});


