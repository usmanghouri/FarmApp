import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Feather, Ionicons } from "@expo/vector-icons"; // Added for icons

// APIs: GET /api/v1/order/user-orders, PUT /api/v1/order/cancel/:id, POST /api/review/add

const emptyReview = {
  productId: null,
  productName: "",
  rating: 0,
  comment: "",
};

// Utility function to get status colors dynamically (Remains the same)
const getStatusStyles = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "delivered":
      return { backgroundColor: COLORS.success, color: COLORS.surface };
    case "shipped":
      return { backgroundColor: COLORS.info, color: COLORS.surface };
    case "processing":
      return { backgroundColor: COLORS.warning, color: COLORS.primaryDark };
    case "pending":
      return { backgroundColor: COLORS.accent, color: COLORS.primaryDark };
    case "canceled":
    case "cancelled":
      return { backgroundColor: COLORS.danger, color: COLORS.surface };
    default:
      return { backgroundColor: COLORS.muted, color: COLORS.surface };
  }
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
    dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A";

  const formatCurrency = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString()}`;

  const cancelOrder = async (orderId) => {
    Alert.alert(
        "Confirm Cancellation",
        "Are you sure you want to cancel this order? This action cannot be undone.",
        [
            { text: "No", style: "cancel" },
            { text: "Yes, Cancel", style: "destructive", onPress: async () => {
                try {
                    setActionMessage("");
                    await apiClient.put(
                      `/api/v1/order/cancel/${orderId}`,
                      {},
                      { withCredentials: true }
                    );
                    setActionMessage("Order successfully cancelled.");
                    fetchOrders();
                  } catch (err) {
                    const msg = err?.response?.data?.message || err.message || "Failed to cancel order";
                    setActionMessage(msg);
                  }
            }}
        ]
    );
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
      setActionMessage("Please provide a rating and comment.");
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
      setActionMessage("Review submitted successfully!");
      setReviewForm(emptyReview);
      fetchOrders();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to submit review";
      setActionMessage(msg);
    }
  };

  // --- NEW: Role-based navigation for "Continue Shopping" ---
  const handleContinueShopping = () => {
      // Assuming this screen is primarily reached by the Buyer/User role.
      // If used by a Farmer/Supplier to buy, they would navigate to "FarmerProducts".
      // We will default to "BuyerProducts" which is the general marketplace browse screen.
      navigation?.navigate?.("BuyerProducts"); 
  };
  // --- END NEW LOGIC ---

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
          onPress={handleContinueShopping} // FIX: Use the new handler
        >
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>

      {actionMessage ? (
        <Text style={[styles.actionMessage, actionMessage.includes("cancelled") || actionMessage.includes("Failed") ? styles.actionMessageDanger : styles.actionMessageSuccess]}>
          {actionMessage}
        </Text>
      ) : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyles(item.status);
          const canCancel = item.status === "pending" || item.status === "processing";

          return (
            <TouchableOpacity 
                style={styles.card}
                // Navigate to OrderDetail screen on card press
                onPress={() => navigation.navigate("OrderDetail", { orderId: item._id })}
            >
              {/* Order Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>
                    ID: <Text style={{color: COLORS.primaryDark}}>{item._id?.slice(-6).toUpperCase()}</Text>
                  </Text>
                  <Text style={styles.dateText}>Placed on {formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text style={[styles.statusBadgeText, { color: statusStyle.color }]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Total Amount */}
              <Text style={styles.amountText}>{formatCurrency(item.totalPrice)}</Text>

              {/* Items Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items Purchased ({item.products?.length || 0})</Text>
                {item.products?.map((product) => (
                  <View key={product._id} style={styles.productRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>
                        {product.productId?.name || "Product"}
                      </Text>
                      <Text style={styles.productMeta}>
                        {product.quantity} x {formatCurrency(product.productId?.price)} / {product.productId?.unit}
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

              {/* Shipping Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shipping Address</Text>
                <Text style={styles.sectionText}>
                  {item.shippingAddress?.street}, {item.shippingAddress?.city}, {item.shippingAddress?.zipCode}
                </Text>
                <Text style={styles.sectionText}>
                  Phone: {item.shippingAddress?.phoneNumber || "N/A"}
                </Text>
              </View>

              {/* Cancel Button */}
              {canCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelOrder(item._id)}
                >
                  <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
             <Ionicons name="cart-outline" size={36} color={COLORS.muted} style={{marginBottom: 10}}/>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              Place your first order to see it here.
            </Text>
          </View>
        }
      />

      {/* Review Submission Form */}
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
            placeholder="Share your thoughts on the product..."
            placeholderTextColor={COLORS.muted}
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
    backgroundColor: '#F0FFF0', 
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16, 
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16, 
    paddingVertical: 8,
    ...SHADOWS.soft,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  actionMessage: {
    fontSize: 14,
    fontWeight: "700",
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    textAlign: "center",
    borderLeftWidth: 5,
    overflow: 'hidden',
  },
  actionMessageSuccess: {
      color: COLORS.success,
      backgroundColor: COLORS.accent,
      borderColor: COLORS.success,
  },
  actionMessageDanger: {
      color: COLORS.danger,
      backgroundColor: COLORS.danger,
      borderColor: COLORS.danger,
      opacity: 0.8,
  },
  // --- Order Card ---
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, 
    padding: 20, 
    marginBottom: 16,
    ...SHADOWS.card,
    borderLeftWidth: 6, 
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.mutedDark,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  statusBadge: (status) => {
    const { backgroundColor, color } = getStatusStyles(status);
    return {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: RADIUS.pill,
      backgroundColor: backgroundColor,
    };
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.surface, 
  },
  amountText: {
    fontSize: 22, 
    fontWeight: "900",
    color: COLORS.primaryDark,
    marginTop: 5,
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
  },
  // --- Product List in Card ---
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.mutedDark,
  },
  productMeta: {
    fontSize: 13,
    color: COLORS.muted,
  },
  reviewButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.info, 
    alignSelf: "flex-start",
    marginLeft: 10,
  },
  reviewButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 12,
  },
  // --- Cancel Button ---
  cancelButton: {
    marginTop: 15,
    borderRadius: RADIUS.pill,
    paddingVertical: 14, 
    alignItems: "center",
    backgroundColor: COLORS.danger,
    ...SHADOWS.soft,
    shadowColor: COLORS.danger,
  },
  cancelButtonText: {
    color: COLORS.surface,
    fontWeight: "800",
    fontSize: 16,
  },
  // --- Empty State ---
  emptyState: {
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
    marginHorizontal: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  // --- Review Card (Modal) ---
  reviewCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: 25,
    ...SHADOWS.card,
    elevation: 20,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryDark
  },
  cancelReviewText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 14
  },
  label: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 6,
    fontWeight: "700"
  },
  ratingRow: {
    flexDirection: "row",
    marginBottom: 15
  },
  star: {
    fontSize: 32, 
    color: COLORS.border,
    marginRight: 10
  },
  starActive: {
    fontSize: 32,
    color: COLORS.warning, 
    marginRight: 10
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.mutedDark,
    marginBottom: 15
  },
  // --- Loading/Error/Retry ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#F0FFF0',
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
    fontWeight: "700",
    fontSize: 15
  }
});