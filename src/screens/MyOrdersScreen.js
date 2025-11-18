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
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  actionMessage: {
    fontSize: 13,
    color: COLORS.success,
    backgroundColor: "#dcfce7",
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    textAlign: "center"
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.card
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  dateText: {
    fontSize: 12,
    color: COLORS.muted
  },
  statusBadge: (status) => ({
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor:
      status === "delivered"
        ? COLORS.success
        : status === "canceled"
        ? COLORS.danger
        : COLORS.warning,
  }),
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.surface
  },
  amountText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 12
  },
  section: {
    marginBottom: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 6
  },
  sectionText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.mutedDark
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.muted
  },
  reviewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.info,
    alignSelf: "flex-start"
  },
  reviewButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 12
  },
  cancelButton: {
    marginTop: 10,
    borderRadius: RADIUS.pill,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: COLORS.danger
  },
  cancelButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 15
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    ...SHADOWS.soft
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: 20
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  cancelReviewText: {
    color: COLORS.danger,
    fontWeight: "600",
    fontSize: 14
  },
  label: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 6,
    fontWeight: "600"
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 12
  },
  star: {
    fontSize: 28,
    color: COLORS.border,
    marginRight: 8
  },
  starActive: {
    fontSize: 28,
    color: COLORS.warning,
    marginRight: 8
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 15
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 24
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.mutedDark
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 8
  },
  errorText: {
    fontSize: 15,
    color: COLORS.mutedDark,
    textAlign: "center",
    marginBottom: 15
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary
  },
  retryText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 15
  }
});


