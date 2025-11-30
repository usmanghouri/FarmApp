import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Feather, Ionicons } from "@expo/vector-icons"; // Added for icons

const STATUSES = [
  "all",
  "pending",
  "processing",
  "confirmed",
  "shipped",
  "delivered",
  "partially_shipped",
  "partially_delivered",
  "partially_cancelled",
  "canceled",
  "cancelled",
];

// Utility function to get status colors dynamically
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
      return { backgroundColor: COLORS.danger, color: COLORS.surface };
    default:
      return { backgroundColor: COLORS.muted, color: COLORS.surface };
  }
};

export default function OrderManagementScreen() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionMessage, setActionMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get("/api/v1/order/supplier-orders", {
        withCredentials: true,
      });
      const data = res.data || {};
      // Handle both response structures: { success: true, orders: [...] } or { orders: [...] }
      let ordersList = [];
      if (data.success !== undefined) {
        // Response has success field
        if (data.success) {
          ordersList = data.orders || [];
        } else {
          setError(data.message || "Failed to load orders");
          return;
        }
      } else {
        // Direct orders array or object with orders
        ordersList = data.orders || data || [];
      }

      // Ensure orders have customer information - log for debugging
      const ordersWithCustomer = ordersList.map((order) => {
        if (
          !order.customer &&
          (!order.buyerId || typeof order.buyerId === "string")
        ) {
          console.warn("Order missing customer info:", order._id, {
            hasCustomer: !!order.customer,
            buyerIdType: typeof order.buyerId,
          });
        }
        return order;
      });

      setOrders(ordersWithCustomer);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to load orders";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const numericTerm = searchTerm.replace(/\D/g, "");
    return orders.filter((order) => {
      const orderStatus = order.orderStatus || order.status || "";
      const matchesStatus =
        statusFilter === "all" ||
        orderStatus?.toLowerCase() === statusFilter.toLowerCase();

      const matchesId = order._id?.toLowerCase().includes(term);
      const matchesProduct = (order.products || []).some((item) => {
        const product = item.productId || item;
        return product?.name?.toLowerCase().includes(term);
      });
      // Handle both customer object and buyerId (which might be object or string)
      const customerObj =
        order.customer ||
        (order.buyerId && typeof order.buyerId === "object"
          ? order.buyerId
          : null);
      const matchesCustomerName =
        customerObj?.name?.toLowerCase().includes(term) || false;
      const matchesCustomerEmail =
        customerObj?.email?.toLowerCase().includes(term) || false;
      const matchesCustomerPhone =
        customerObj?.phone?.toLowerCase().includes(term) || false;
      const matchesAddress =
        order.shippingAddress?.street?.toLowerCase().includes(term) || false;
      const matchesCity =
        order.shippingAddress?.city?.toLowerCase().includes(term) || false;
      const phoneDigits =
        order.shippingAddress?.phoneNumber?.replace(/\D/g, "") || "";
      const matchesPhone =
        numericTerm.length > 0 ? phoneDigits.includes(numericTerm) : false;

      const matchesSearch =
        !term ||
        matchesId ||
        matchesProduct ||
        matchesCustomerName ||
        matchesCustomerEmail ||
        matchesCustomerPhone ||
        matchesAddress ||
        matchesCity ||
        matchesPhone;

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const updateStatus = async (orderId, newStatus) => {
    if (!orderId || orderId === "undefined" || typeof orderId !== "string") {
      setActionMessage("Invalid order ID");
      return;
    }
    try {
      setActionMessage("");
      await apiClient.put(
        `/api/v1/order/update-status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setActionMessage(`Status updated to ${newStatus.toUpperCase()}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update status";
      setActionMessage(msg);
    }
  };

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

  const renderOrderCard = ({ item }) => {
    const orderStatus = item.orderStatus || item.status || "pending";
    const orderStatusStyles = getStatusStyles(orderStatus);
    // Prioritize customer field, then buyerId (per API spec)
    // Handle both populated objects and string IDs
    const customer =
      item.customer ||
      (item.buyerId && typeof item.buyerId === "object" ? item.buyerId : null);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>
              Order #
              <Text style={{ color: COLORS.primaryDark }}>
                {item._id?.slice(-6).toUpperCase()}
              </Text>
            </Text>
            <View style={styles.dateRow}>
              <Feather name="calendar" size={12} color={COLORS.muted} />
              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>
            </View>
          </View>
          <Text style={styles.amountText}>
            Rs. {Number(item.totalPrice || 0).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.productsText}>
          <Feather name="package" size={14} color={COLORS.mutedDark} />
          {item.products?.length || 0} items •{" "}
          {item.products?.[0]?.productId?.name ||
            item.products?.[0]?.name ||
            "N/A"}
        </Text>

        {/* Customer Information */}
        <View style={styles.customerInfoRow}>
          <Feather name="user" size={14} color={COLORS.mutedDark} />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer?.name || "N/A"}</Text>
            {customer?.email && (
              <View style={styles.contactRow}>
                <Feather name="mail" size={11} color={COLORS.muted} />
                <Text style={styles.customerContact}>{customer.email}</Text>
              </View>
            )}
            {customer?.phone && (
              <View style={styles.contactRow}>
                <Feather name="phone" size={11} color={COLORS.muted} />
                <Text style={styles.customerContact}>{customer.phone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statusRowCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: orderStatusStyles.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: orderStatusStyles.color },
              ]}
            >
              {orderStatus?.toUpperCase()}
            </Text>
          </View>
          <View
            style={[
              styles.paymentBadge,
              item.paymentInfo?.status === "completed"
                ? { backgroundColor: COLORS.success }
                : { backgroundColor: COLORS.warning },
            ]}
          >
            <Text style={styles.paymentBadgeText}>
              {item.paymentInfo?.status || "pending"}
            </Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Feather name="map-pin" size={14} color={COLORS.muted} />
          <Text style={styles.addressText}>
            {item.shippingAddress?.street || "Street"},{" "}
            {item.shippingAddress?.city || "City"}
          </Text>
        </View>

        {/* View Details Button */}
        <View style={styles.statusSelector}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate("OrderDetail", { order: item })}
          >
            <Text style={styles.detailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Order Management</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by order ID, customer, product, address, or phone..."
        placeholderTextColor={COLORS.muted}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Status Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusRowScroll}
      >
        <View style={styles.statusRow}>
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusChip,
                statusFilter === s && styles.statusChipActive,
                // Apply active status color if active
                statusFilter === s && {
                  backgroundColor: getStatusStyles(s).backgroundColor,
                  borderColor: getStatusStyles(s).backgroundColor,
                },
              ]}
              onPress={() => setStatusFilter(s)}
            >
              <Text
                style={[
                  styles.statusText,
                  statusFilter === s && styles.statusTextActive,
                  // Apply text color based on chip background (only if active)
                  statusFilter === s && { color: getStatusStyles(s).color },
                ]}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {actionMessage ? (
        <Text
          style={[
            styles.actionMessage,
            actionMessage.includes("Failed")
              ? { color: COLORS.danger }
              : { color: COLORS.success },
          ]}
        >
          {actionMessage}
        </Text>
      ) : null}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={renderOrderCard}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="cart-outline"
              size={30}
              color={COLORS.muted}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.emptyTitle}>No orders match the filter</Text>
            <Text style={styles.emptyText}>
              Adjust filters or search to see results.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // IMPROVEMENT: Soft green background
    backgroundColor: "#F0FFF0",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    color: COLORS.mutedDark,
  },
  // --- Status Filter Chips ---

  statusRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    marginBottom: 6,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  // In your styles object, update these:
  statusRowScroll: {
    maxHeight: 50, // Increased height
    marginBottom: 15,
  },
  statusChip: {
    paddingHorizontal: 16, // Increased from 12
    paddingVertical: 8, // Increased from 5
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border,
    marginRight: 10, // Increased spacing
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 1,
    minHeight: 36, // Ensure minimum height
  },
  statusText: {
    fontSize: 14, // Increased from 13
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  statusTextActive: {
    // Styles handled by getStatusStyles and applied inline for dynamic colors
  },
  actionMessage: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
  },
  // --- Order Card ---
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.soft,
    borderLeftWidth: 5,
    borderColor: COLORS.primary, // Themed border
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  orderId: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.mutedDark,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  amountText: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  productsText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusRowCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    marginRight: 10,
    minWidth: 90,
    alignItems: "center",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    minWidth: 80,
    alignItems: "center",
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.surface,
  },
  customerInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  customerContact: {
    fontSize: 12,
    color: COLORS.muted,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  // --- Status Update Actions ---
  statusSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  nextStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    gap: 5,
    ...SHADOWS.soft,
  },
  nextStatusText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  detailsButton: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  detailsText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  // --- Utility Styles ---
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.mutedDark,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F0FFF0",
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.mutedDark,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
