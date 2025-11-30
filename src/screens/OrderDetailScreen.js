import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from "@expo/vector-icons";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === "delivered") return { bg: COLORS.success, text: COLORS.surface };
  if (s === "shipped") return { bg: COLORS.info, text: COLORS.surface };
  if (s === "processing")
    return { bg: COLORS.warning, text: COLORS.primaryDark };
  if (s === "pending") return { bg: COLORS.accent, text: COLORS.primaryDark };
  if (s === "cancelled" || s === "canceled")
    return { bg: COLORS.danger, text: COLORS.surface };
  return { bg: COLORS.muted, text: COLORS.surface };
};

export default function OrderDetailScreen({ navigation }) {
  const route = useRoute();
  const {
    order: orderParam,
    orderId,
    allowStatusUpdate = true,
  } = route.params || {};
  const [order, setOrder] = useState(orderParam || null);
  const [loading, setLoading] = useState(!orderParam);
  const [error, setError] = useState("");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const canUpdateStatus = Boolean(allowStatusUpdate);

  // Get the actual order ID from order object or route param
  const currentOrderId =
    order?._id || (orderId && orderId !== "undefined" ? orderId : null);

  useEffect(() => {
    // If order is passed directly, use it; otherwise fetch by orderId
    if (orderParam && orderParam._id) {
      setOrder(orderParam);
      setLoading(false);
      setError("");
    } else if (orderId && orderId !== "undefined") {
      fetchOrderDetails();
    } else {
      setError("No order ID or order data provided");
      setLoading(false);
    }
  }, [orderId, orderParam]);

  const fetchOrderDetails = async () => {
    if (!orderId || orderId === "undefined" || typeof orderId !== "string") {
      setError("No valid order ID provided");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Try to fetch from supplier-orders or user-orders and find the specific order
      // Since there's no direct /order/item/:id endpoint, we'll fetch all orders and filter
      const [supplierRes, userRes] = await Promise.allSettled([
        apiClient.get("/api/v1/order/supplier-orders", {
          withCredentials: true,
        }),
        apiClient.get("/api/v1/order/user-orders", { withCredentials: true }),
      ]);

      let foundOrder = null;

      // Check supplier orders response
      if (supplierRes.status === "fulfilled") {
        const supplierData = supplierRes.value.data || {};
        const orders = supplierData.success
          ? supplierData.orders
          : supplierData.orders || [];
        foundOrder = orders.find((o) => o._id === orderId);
      }

      // Check user orders response if not found
      if (!foundOrder && userRes.status === "fulfilled") {
        const userData = userRes.value.data || {};
        const orders = userData.success
          ? userData.orders
          : userData.orders || [];
        foundOrder = orders.find((o) => o._id === orderId);
      }

      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError(err.response?.data?.message || "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (
      !currentOrderId ||
      currentOrderId === "undefined" ||
      typeof currentOrderId !== "string"
    ) {
      Alert.alert("Error", "Order ID is missing or invalid");
      return;
    }
    try {
      setUpdatingStatus(true);
      await apiClient.put(
        `/api/v1/order/update-status/${currentOrderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      Alert.alert("Success", "Order status updated successfully!");
      setStatusModalVisible(false);
      fetchOrderDetails();
    } catch (err) {
      console.error("Failed to update status:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === order.status) {
      setStatusModalVisible(false);
      return;
    }

    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to change order status to "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => updateOrderStatus(newStatus),
        },
      ]
    );
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
        <Ionicons name="alert-circle" size={50} color={COLORS.danger} />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchOrderDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Order not found.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const orderStatus = order.orderStatus || order.status || "pending";
  const statusStyle = getStatusColor(orderStatus);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.orderId}>
                Order #{order._id?.slice(-6).toUpperCase()}
              </Text>
              <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {orderStatus?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Status Change Button */}
          {canUpdateStatus && (
            <TouchableOpacity
              style={styles.changeStatusButton}
              onPress={() => setStatusModalVisible(true)}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.changeStatusText}>Change Status</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(order.totalPrice)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={styles.summaryValue}>
              {order.paymentInfo?.method?.replace(/-/g, " ").toUpperCase() ||
                "N/A"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status:</Text>
            <Text style={styles.summaryValue}>
              {order.paymentInfo?.status?.toUpperCase() || "N/A"}
            </Text>
          </View>
          {order.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Order Notes:</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </View>

        {/* Products */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Products ({order.products?.length || 0})
          </Text>
          {order.products?.map((product, index) => {
            const productData = product.productId || product;
            const vendorName =
              product.farmerId?.name || product.supplierId?.name || "N/A";
            return (
              <View key={product._id || index} style={styles.productItem}>
                <Image
                  source={{
                    uri:
                      productData?.images?.[0] ||
                      "https://via.placeholder.com/50",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {productData?.name || "Product"}
                  </Text>
                  <Text style={styles.productMeta}>
                    Quantity: {product.quantity} ×{" "}
                    {formatCurrency(productData?.price || product.price || 0)} /{" "}
                    {productData?.unit || product.unit || "unit"}
                  </Text>
                  <Text style={styles.productMeta}>Vendor: {vendorName}</Text>
                  {product.status && (
                    <Text style={styles.productMeta}>
                      Status: {product.status?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.productPrice}>
                  {formatCurrency(
                    product.quantity *
                      (productData?.price || product.price || 0)
                  )}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          {(() => {
            // Prioritize customer field, then buyerId (per API spec)
            // Handle both populated objects and string IDs
            const customer =
              order.customer ||
              (order.buyerId && typeof order.buyerId === "object"
                ? order.buyerId
                : null);
            return (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>
                    {customer?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>
                    {customer?.email || "N/A"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>
                    {customer?.phone ||
                      order.shippingAddress?.phoneNumber ||
                      "N/A"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address:</Text>
                  <Text
                    style={[styles.infoValue, { textAlign: "right", flex: 2 }]}
                  >
                    {customer?.address ||
                      (order.shippingAddress?.street &&
                      order.shippingAddress?.city
                        ? `${order.shippingAddress.street}, ${order.shippingAddress.city}`
                        : "N/A")}
                  </Text>
                </View>
                {order.notes && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order Notes:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { textAlign: "right", flex: 2 },
                      ]}
                    >
                      {order.notes}
                    </Text>
                  </View>
                )}
                {order.deliveryInfo?.notes && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Delivery Notes:</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        { textAlign: "right", flex: 2 },
                      ]}
                    >
                      {order.deliveryInfo.notes}
                    </Text>
                  </View>
                )}
              </>
            );
          })()}
        </View>

        {/* Shipping Address */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressText}>
                {order.shippingAddress?.street || order.street || "N/A"}
              </Text>
              <Text style={styles.addressText}>
                {order.shippingAddress?.city || order.city || ""}{" "}
                {order.shippingAddress?.zipCode || order.zipCode || ""}
              </Text>
              {order.shippingAddress?.phoneNumber && (
                <Text style={styles.addressText}>
                  Phone: {order.shippingAddress.phoneNumber}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Status Change Modal */}
      {canUpdateStatus && (
        <Modal
          visible={statusModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Change Order Status</Text>
                <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.mutedDark} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.statusList}>
                {ORDER_STATUSES.map((status) => {
                  const isCurrentStatus = status === orderStatus;
                  const statusStyle = getStatusColor(status);
                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        isCurrentStatus && styles.statusOptionActive,
                      ]}
                      onPress={() => handleStatusChange(status)}
                      disabled={isCurrentStatus || updatingStatus}
                    >
                      <View
                        style={[
                          styles.statusIndicator,
                          { backgroundColor: statusStyle.bg },
                        ]}
                      />
                      <Text style={styles.statusOptionText}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                      {isCurrentStatus && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={COLORS.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {updatingStatus && (
                <View style={styles.updatingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.updatingText}>Updating status...</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF0",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F0FFF0",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.mutedDark,
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.danger,
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: RADIUS.pill,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 15,
    ...SHADOWS.card,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  orderId: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: RADIUS.pill,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  changeStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  changeStatusText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 15,
    ...SHADOWS.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 15,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  notesContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.mutedDark,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    lineHeight: 20,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    marginRight: 15,
    backgroundColor: COLORS.background,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 5,
  },
  productMeta: {
    fontSize: 13,
    color: COLORS.muted,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    marginBottom: 5,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.mutedDark,
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  statusList: {
    padding: 20,
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.accent,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  updatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  updatingText: {
    fontSize: 14,
    color: COLORS.mutedDark,
  },
});
