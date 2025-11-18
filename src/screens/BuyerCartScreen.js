import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { apiClient } from "../api/client";

// Mobile counterpart of src/pages/BuyerCart.jsx.
// For full functionality, reuse the same cart endpoints as the web buyer cart page.

export default function BuyerCartScreen({ navigation }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/cart/my-cart", { withCredentials: true });
      setCart(response.data.cart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err.response?.data?.message || "Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await apiClient.put(
        `/api/cart/update-item/${productId}`,
        { quantity: newQuantity },
        { withCredentials: true }
      );
      fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to update quantity.");
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await apiClient.delete(`/api/cart/remove-item/${productId}`, { withCredentials: true });
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to remove item.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.product.images[0] }} style={styles.productImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>₨ {item.product.price.toLocaleString()}</Text>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => handleQuantityChange(item.product._id, item.quantity - 1)}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemQuantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(item.product._id, item.quantity + 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemoveItem(item.product._id)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Cart</Text>
      {cart && cart.products && cart.products.length > 0 ? (
        <>
          <FlatList
            data={cart.products}
            renderItem={renderItem}
            keyExtractor={(item) => item.product._id}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>₨ {cart.totalPrice?.toLocaleString() || '0'}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => Alert.alert("Checkout", "Proceed to checkout?")}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.centeredNoCart}>
          <Text style={styles.noCartText}>Your cart is empty.</Text>
          <TouchableOpacity style={styles.shopNowButton} onPress={() => navigation.navigate("BuyerProducts")}>
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
  },
  productPrice: {
    fontSize: 14,
    color: "#166534",
    fontWeight: "700",
    marginTop: 4,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#e0f2f7",
    borderRadius: 6,
    padding: 4,
  },
  quantityButton: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#166534",
    paddingHorizontal: 10,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    paddingHorizontal: 10,
  },
  removeButton: {
    backgroundColor: "#f44336",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  removeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#166534",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
  },
  checkoutButton: {
    backgroundColor: "#166534",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    padding: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  centeredNoCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  noCartText: {
    fontSize: 18,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },
  shopNowButton: {
    backgroundColor: "#166534",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  shopNowButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});


