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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Feather, Ionicons } from '@expo/vector-icons'; // Added for icons

// APIs used: cart/my-cart, cart/update, cart/item/:productId, cart/clear, order/place-order

const checkoutEmptyState = {
  fullName: "",
  phoneNumber: "",
  street: "",
  city: "",
  zipCode: "",
  notes: "",
  paymentMethod: "cash-on-delivery",
};

// Payment mapping for display
const PAYMENT_METHODS = [
    { key: "cash-on-delivery", name: "Cash on Delivery" },
    { key: "easypaisa", name: "EasyPaisa" },
    { key: "jazzcash", name: "JazzCash" },
];

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
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        try {
          setActionMessage("");
          await apiClient.delete(`/api/cart/item/${productId}`, { withCredentials: true });
          setCartItems((prev) => prev.filter((item) => item.productId !== productId));
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || "Failed to remove item";
          setActionMessage(msg);
        }
      }}
    ]);
  };

  const clearCart = async () => {
    Alert.alert("Clear Cart", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        try {
          setActionMessage("");
          await apiClient.delete("/api/cart/clear", { withCredentials: true });
          setCartItems([]);
          setCartId(null);
        } catch (err) {
          const msg = err?.response?.data?.message || err.message || "Failed to clear cart";
          setActionMessage(msg);
        }
      }}
    ]);
  };

  const handleCheckoutChange = (field, value) => {
    setCheckoutForm((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    if (!cartId) {
      setActionMessage("No cart found");
      return;
    }
    // Basic validation
    if (!checkoutForm.fullName || !checkoutForm.street || !checkoutForm.city || !checkoutForm.phoneNumber) {
        setActionMessage("Please fill in all required delivery details.");
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
      setActionMessage("Order placed successfully! Redirecting...");
      setCheckoutVisible(false);
      setCheckoutForm(checkoutEmptyState);
      fetchCart();
      
      // Navigate to order history or confirmation page
      navigation?.navigate?.("MyOrders"); 
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to place order";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
    <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
    >
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.heading}>Your Shopping Cart</Text>
                {cartItems.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                         <Feather name="trash-2" size={14} color={COLORS.danger} />
                        <Text style={styles.clearButtonText}>Clear Cart</Text>
                    </TouchableOpacity>
                )}
            </View>

            {actionMessage ? (
                <Text style={[styles.actionMessage, actionMessage.includes("Failed") || actionMessage.includes("Error") ? styles.actionMessageDanger : styles.actionMessageSuccess]}>
                    {actionMessage}
                </Text>
            ) : null}

            {cartItems.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="cart-outline" size={48} color={COLORS.muted} style={{marginBottom: 10}}/>
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
                                <View style={styles.cardContent}>
                                    <View style={styles.imageWrapper}>
                                        {item.images?.[0] ? (
                                            <Image source={{ uri: item.images[0] }} style={styles.image} />
                                        ) : (
                                            <View style={styles.imagePlaceholder}>
                                                <Feather name="image" size={24} color={COLORS.muted} />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.detailsColumn}>
                                        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.productMeta}>
                                            {item.category} | {item.unit} | Seller: {item.seller?.uploaderName || "Unknown"}
                                        </Text>
                                        <Text style={styles.priceText}>
                                            Unit Price: Rs. {(item.price || 0).toLocaleString()}
                                        </Text>
                                        <Text style={styles.subtotalText}>
                                            Subtotal: Rs. {((item.price || 0) * (item.quantity || 0)).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.actionsRow}>
                                    <View style={styles.quantityControl}>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                                            style={[styles.quantityButton, { borderRightWidth: 1 }]}
                                        >
                                            <Text style={styles.quantityButtonText}>-</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.quantityValue}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                                            style={[styles.quantityButton, { borderLeftWidth: 1 }]}
                                        >
                                            <Text style={styles.quantityButtonText}>+</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeItem(item.productId)}
                                    >
                                        <Feather name="trash-2" size={16} color={COLORS.surface} />
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />

                    {/* Summary and Checkout Toggle */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Cart Total</Text>
                            <Text style={styles.summaryValue}>Rs. {total.toLocaleString()}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setCheckoutVisible((prev) => !prev)}
                        >
                            <Text style={styles.primaryButtonText}>
                                {checkoutVisible ? "Hide Checkout Form" : "Proceed to Checkout"}
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

            {/* Checkout Form Scrollable Overlay */}
            {checkoutVisible && cartItems.length > 0 && (
                <ScrollView style={styles.checkoutCard}>
                    <Text style={styles.checkoutTitle}>Delivery & Payment</Text>

                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>Delivery Details</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Full Name *</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={COLORS.muted}
                                placeholder="Enter full name"
                                value={checkoutForm.fullName}
                                onChangeText={(t) => handleCheckoutChange("fullName", t)}
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Phone Number *</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={COLORS.muted}
                                placeholder="Enter phone number"
                                value={checkoutForm.phoneNumber}
                                onChangeText={(t) => handleCheckoutChange("phoneNumber", t)}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Street/Area *</Text>
                            <TextInput
                                style={styles.input}
                                placeholderTextColor={COLORS.muted}
                                placeholder="e.g., House No. 123, Lane 4"
                                value={checkoutForm.street}
                                onChangeText={(t) => handleCheckoutChange("street", t)}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.label}>City *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={COLORS.muted}
                                    value={checkoutForm.city}
                                    onChangeText={(t) => handleCheckoutChange("city", t)}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Zip code</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor={COLORS.muted}
                                    value={checkoutForm.zipCode}
                                    onChangeText={(t) => handleCheckoutChange("zipCode", t)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, { height: 70, textAlignVertical: "top" }]}
                                multiline
                                placeholderTextColor={COLORS.muted}
                                placeholder="e.g., Leave order with guard."
                                value={checkoutForm.notes}
                                onChangeText={(t) => handleCheckoutChange("notes", t)}
                            />
                        </View>
                    </View>

                    <View style={styles.formSection}>
                         <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentRow}>
                            {PAYMENT_METHODS.map((method) => (
                                <TouchableOpacity
                                    key={method.key}
                                    style={[
                                        styles.paymentChip,
                                        checkoutForm.paymentMethod === method.key && styles.paymentChipActive
                                    ]}
                                    onPress={() => handleCheckoutChange("paymentMethod", method.key)}
                                >
                                    <Text
                                        style={[
                                            styles.paymentChipText,
                                            checkoutForm.paymentMethod === method.key && styles.paymentChipTextActive
                                        ]}
                                    >
                                        {method.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                   
                    <TouchableOpacity style={[styles.primaryButton, {marginTop: 20}]} onPress={placeOrder}>
                        <Text style={styles.primaryButtonText}>Confirm Order (Rs. {total.toLocaleString()})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelCheckoutButton} onPress={() => setCheckoutVisible(false)}>
                        <Text style={styles.cancelCheckoutText}>Cancel Checkout</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // --- General Layout ---
  container: {
    flex: 1,
    // IMPROVEMENT: Soft green background
    backgroundColor: '#F0FFF0',
    paddingHorizontal: 16,
    paddingTop: 16
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
    color: COLORS.primaryDark
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  clearButtonText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 14,
  },
  // --- Action Messages ---
  actionMessage: {
    fontSize: 14,
    fontWeight: "700",
    padding: 10,
    borderRadius: RADIUS.md,
    marginBottom: 16,
    textAlign: "center",
    borderLeftWidth: 5,
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
  // --- Item Card ---
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 15,
    ...SHADOWS.card,
    borderLeftWidth: 5,
    borderColor: COLORS.primaryLight,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    overflow: "hidden",
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  detailsColumn: {
      flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 2,
  },
  priceText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.mutedDark,
  },
  subtotalText: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.primary,
      marginTop: 4,
  },
  // --- Quantity/Remove Actions ---
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: "hidden"
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  quantityValue: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary
  },
  removeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.danger,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  removeButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14
  },
  // --- Summary Card ---
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    ...SHADOWS.card
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  summaryLabel: {
    fontSize: 18,
    color: COLORS.mutedDark,
    fontWeight: "700"
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  // --- Primary/Secondary Buttons ---
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 10,
    ...SHADOWS.soft,
    shadowColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "800"
  },
  secondaryButton: {
    borderRadius: RADIUS.pill,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700"
  },
  // --- Checkout Form Card ---
  checkoutCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: 25,
    ...SHADOWS.card,
    elevation: 20,
  },
  checkoutTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 20,
    textAlign: "center"
  },
  formSection: {
      marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 15
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10
  },
  label: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 6,
    fontWeight: "700"
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    fontSize: 14,
    color: COLORS.mutedDark
  },
  // --- Payment Chips ---
  paymentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    gap: 10
  },
  paymentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  paymentChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.primary,
  },
  paymentChipText: {
    color: COLORS.mutedDark,
    fontWeight: "600",
    fontSize: 13
  },
  paymentChipTextActive: {
    color: COLORS.primaryDark
  },
  // --- Empty State ---
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
    marginHorizontal: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 10
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 20
  },
  cancelCheckoutButton: {
      marginTop: 10,
      alignItems: 'center',
  },
  cancelCheckoutText: {
      color: COLORS.muted,
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
  },
  // --- Utility ---
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