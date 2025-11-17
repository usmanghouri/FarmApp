import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// APIs used: cart/my-cart, cart/update, cart/item/:productId, cart/clear, order/place-order

const checkoutEmptyState = {
  fullName: "",
  phoneNumber: "",
  street: "",
  city: "",
  zipCode: "",
  notes: "",
  paymentMethod: "cash-on-delivery"
};

export default function ShoppingCartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(checkoutEmptyState);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get("/api/cart/my-cart", { withCredentials: true });
      const data = res.data || {};
      setCartId(data.cart?._id || null);
      const mapped =
        data.cart?.products?.map((item) => ({
          cartItemId: item._id,
          quantity: item.quantity,
          productId: item.productId?._id,
          name: item.productId?.name,
          description: item.productId?.description,
          price: item.productId?.price,
          unit: item.productId?.unit,
          images: item.productId?.images,
          seller: item.productId?.upLoadedBy,
          category: item.productId?.category
        })) || [];
      setCartItems(mapped);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load cart";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    try {
      setActionMessage("");
      await apiClient.put(
        "/api/cart/update",
        { productId, quantity },
        { withCredentials: true }
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to update quantity";
      setActionMessage(msg);
      fetchCart();
    }
  };

  const removeItem = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.delete(`/api/cart/item/${productId}`, { withCredentials: true });
      setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to remove item";
      setActionMessage(msg);
    }
  };

  const clearCart = async () => {
    try {
      setActionMessage("");
      await apiClient.delete("/api/cart/clear", { withCredentials: true });
      setCartItems([]);
      setCartId(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to clear cart";
      setActionMessage(msg);
    }
  };

  const handleCheckoutChange = (field, value) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    if (!cartId) {
      setActionMessage("No cart found");
      return;
    }
    try {
      setActionMessage("");
      await apiClient.post(
        "/api/v1/order/place-order",
        {
          cartId,
          paymentMethod: checkoutForm.paymentMethod,
          street: checkoutForm.street,
          city: checkoutForm.city,
          zipCode: checkoutForm.zipCode,
          phoneNumber: checkoutForm.phoneNumber,
          notes: checkoutForm.notes
        },
        { withCredentials: true }
      );
      setActionMessage("Order placed successfully");
      setCheckoutVisible(false);
      setCheckoutForm(checkoutEmptyState);
      fetchCart();
      navigation?.navigate?.("MyOrders");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to place order";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchCart} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Your Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </TouchableOpacity>
        )}
      </View>

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      {cartItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add items from the marketplace to get started.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation?.navigate?.("FarmerProducts")}
          >
            <Text style={styles.primaryButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.cartItemId}
            contentContainerStyle={{ paddingBottom: 16 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.imageWrapper}>
                    {item.images?.[0] ? (
                      <Image source={{ uri: item.images[0] }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Text style={styles.imagePlaceholderText}>No image</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productMeta}>
                      {item.category} • {item.unit}
                    </Text>
                    <Text style={styles.productMeta}>
                      Seller: {item.seller?.uploaderName || "Unknown"}
                    </Text>
                    <Text style={styles.priceText}>
                      Rs. {(item.price || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                      style={styles.quantityButton}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.productId)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCheckoutVisible((prev) => !prev)}
            >
              <Text style={styles.primaryButtonText}>
                {checkoutVisible ? "Hide Checkout" : "Proceed to Checkout"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation?.navigate?.("FarmerProducts")}
            >
              <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {checkoutVisible && cartItems.length > 0 && (
        <ScrollView style={styles.checkoutCard}>
          <Text style={styles.checkoutTitle}>Checkout</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={checkoutForm.fullName}
              onChangeText={(t) => handleCheckoutChange("fullName", t)}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={checkoutForm.phoneNumber}
              onChangeText={(t) => handleCheckoutChange("phoneNumber", t)}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Street</Text>
            <TextInput
              style={styles.input}
              value={checkoutForm.street}
              onChangeText={(t) => handleCheckoutChange("street", t)}
            />
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={checkoutForm.city}
                onChangeText={(t) => handleCheckoutChange("city", t)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Zip code</Text>
              <TextInput
                style={styles.input}
                value={checkoutForm.zipCode}
                onChangeText={(t) => handleCheckoutChange("zipCode", t)}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              multiline
              value={checkoutForm.notes}
              onChangeText={(t) => handleCheckoutChange("notes", t)}
            />
          </View>

          <Text style={[styles.label, { marginTop: 4 }]}>Payment Method</Text>
          <View style={styles.paymentRow}>
            {["cash-on-delivery", "easypaisa", "jazzcash"].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentChip,
                  checkoutForm.paymentMethod === method && styles.paymentChipActive
                ]}
                onPress={() => handleCheckoutChange("paymentMethod", method)}
              >
                <Text
                  style={[
                    styles.paymentChipText,
                    checkoutForm.paymentMethod === method && styles.paymentChipTextActive
                  ]}
                >
                  {method.replace(/-/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={placeOrder}>
            <Text style={styles.primaryButtonText}>Place Order</Text>
          </TouchableOpacity>
        </ScrollView>
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
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#b91c1c"
  },
  clearButtonText: {
    color: "#b91c1c",
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
    padding: 12,
    marginBottom: 12,
    ...SHADOWS.card
  },
  cardRow: {
    flexDirection: "row"
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: "#9ca3af"
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  productMeta: {
    fontSize: 12,
    color: "#6b7280"
  },
  priceText: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#166534"
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    overflow: "hidden"
  },
  quantityButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f3f4f6"
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151"
  },
  quantityValue: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827"
  },
  removeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fee2e2"
  },
  removeButtonText: {
    color: "#b91c1c",
    fontWeight: "600"
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    ...SHADOWS.card
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  summaryLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534"
  },
  primaryButton: {
    backgroundColor: "#166534",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700"
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db"
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600"
  },
  checkoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.card
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12
  },
  formGroup: {
    marginBottom: 10
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 10
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff"
  },
  paymentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  paymentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 8,
    marginBottom: 6
  },
  paymentChipActive: {
    backgroundColor: "#166534",
    borderColor: "#166534"
  },
  paymentChipText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 12
  },
  paymentChipTextActive: {
    color: "#ffffff"
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16
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


