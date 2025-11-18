import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  FlatList,
  TouchableOpacity
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile version of OrderManagement.jsx
// APIs:
//  GET /api/v1/order/supplier-orders
//  PUT /api/v1/order/update-status/:id

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "canceled"];

export default function OrderManagementScreen() {
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
      const res = await apiClient.get(
        "/api/v1/order/supplier-orders",
        { withCredentials: true }
      );
      const data = res.data || {};
      setOrders(data.orders || []);
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
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        !term ||
        order._id?.toLowerCase().includes(term) ||
        order.products?.some((p) =>
          p.name?.toLowerCase().includes(term)
        ) ||
        order.shippingAddress?.city?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      setActionMessage("");
      await apiClient.put(
        `/api/v1/order/update-status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setActionMessage("Order status updated");
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update status";
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
      <Text style={styles.heading}>Order Management</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by order ID, product, city..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.statusRow}>
        {STATUSES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.statusChip,
              statusFilter === s && styles.statusChipActive
            ]}
            onPress={() => setStatusFilter(s)}
          >
            <Text
              style={[
                styles.statusText,
                statusFilter === s && styles.statusTextActive
              ]}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.orderId}>
                  Order #{item._id?.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <Text style={styles.amountText}>
                Rs. {Number(item.totalPrice || 0).toLocaleString()}
              </Text>
            </View>

            <Text style={styles.productsText}>
              {item.products?.length || 0} items •{" "}
              {item.products?.[0]?.name || "N/A"}
            </Text>

            <View style={styles.statusRowCard}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.paymentBadge(item.paymentInfo?.status)}>
                {item.paymentInfo?.status}
              </Text>
            </View>

            <Text style={styles.addressText}>
              {item.shippingAddress?.street || "Street"},{" "}
              {item.shippingAddress?.city || "City"}
            </Text>

            <View style={styles.statusSelector}>
              {STATUSES.filter((s) => s !== "all").map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    item.status === status && styles.statusOptionActive
                  ]}
                  onPress={() => updateStatus(item._id, status)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      item.status === status && styles.statusOptionTextActive
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No orders found</Text>
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
    marginBottom: 6
  },
  statusChipActive: {
    backgroundColor: COLORS.primary
  },
  statusText: {
    fontSize: 12,
    color: COLORS.mutedDark,
    fontWeight: "600"
  },
  statusTextActive: {
    color: "#ffffff"
  },
  actionMessage: {
    fontSize: 12,
    color: COLORS.primary,
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
    marginBottom: 6
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.mutedDark
  },
  dateText: {
    fontSize: 12,
    color: COLORS.muted
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  productsText: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 6
  },
  statusRowCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#dcfce7",
    borderRadius: RADIUS.pill,
    marginRight: 8
  },
  statusBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "700"
  },
  paymentBadge: (status) => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: status === "completed" ? "#d1fae5" : "#fef3c7",
    color: status === "completed" ? "#047857" : "#b45309",
    fontSize: 11,
    fontWeight: "700"
  }),
  addressText: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8
  },
  statusSelector: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  statusOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
    marginBottom: 6
  },
  statusOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  statusOptionText: {
    fontSize: 12,
    color: COLORS.mutedDark,
    fontWeight: "600"
  },
  statusOptionTextActive: {
    color: "#ffffff"
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.mutedDark,
    marginBottom: 4
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center"
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.muted
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 6
  },
  errorText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 10
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600"
  }
});


