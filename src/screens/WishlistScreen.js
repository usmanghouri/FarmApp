import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from '@expo/vector-icons'; // Added for icons

// APIs: GET /api/wishlist/my-wishlist, DELETE /api/wishlist/item/:productId,
// DELETE /api/wishlist/clear, POST /api/wishlist/addtocart

export default function WishlistScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(
        "/api/wishlist/my-wishlist",
        { withCredentials: true }
      );
      const data = res.data || {};
      setItems(data.wishlist?.products || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load wishlist";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const triggerActionMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 2500);
  };

  const removeItem = async (productId) => {
    try {
      await apiClient.delete(
        `/api/wishlist/item/${productId}`,
        { withCredentials: true }
      );
      setItems((prev) => prev.filter((item) => item.productId?._id !== productId));
      triggerActionMessage("Item removed from wishlist.");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to remove item";
      triggerActionMessage(msg);
    }
  };

  const clearWishlist = async () => {
    try {
      await apiClient.delete(
        "/api/wishlist/clear",
        { withCredentials: true }
      );
      setItems([]);
      triggerActionMessage("Wishlist cleared successfully!");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to clear wishlist";
      triggerActionMessage(msg);
    }
  };

  const addToCart = async (productId) => {
    try {
      await apiClient.post(
        "/api/wishlist/addtocart",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      triggerActionMessage("Product added to cart!");
      // Optionally remove from wishlist after adding to cart
      removeItem(productId); 
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add to cart";
      triggerActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchWishlist} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Wishlist ({items.length})</Text>
        {items.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearWishlist}>
             <Feather name="trash-2" size={14} color={COLORS.danger} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {actionMessage ? (
        <Text style={[styles.actionMessage, actionMessage.includes("Failed") || actionMessage.includes("Error") ? styles.actionMessageDanger : styles.actionMessageSuccess]}>
          {actionMessage}
        </Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const product = item.productId || {};
          const imageUrl = product.images?.[0];
          const isAvailable = product.isAvailable;

          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.imageWrapper}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Feather name="image" size={24} color={COLORS.muted} />
                    </View>
                  )}
                  {!isAvailable && (
                    <View style={styles.badgeUnavailable}>
                      <Text style={styles.badgeText}>Out of Stock</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailsColumn}>
                  <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name="pricetag-outline" size={12} color={COLORS.primaryDark} />
                    <Text style={styles.productMeta}>
                      {product.category}
                    </Text>
                    <Feather name="package" size={12} color={COLORS.primaryDark} />
                    <Text style={styles.productMeta}>
                       {product.unit}
                    </Text>
                  </View>
                  
                  <Text style={styles.priceText}>
                    Rs. {(product.price || 0).toLocaleString()}
                  </Text>
                  
                  <Text style={styles.supplierText}>
                    Supplier: {product.upLoadedBy?.uploaderName || "Unknown"}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => removeItem(product._id)}
                >
                  <Text style={styles.secondaryButtonText}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, !isAvailable && styles.primaryButtonDisabled]}
                  onPress={() => addToCart(product._id)}
                  disabled={!isAvailable}
                >
                  <Text style={styles.primaryButtonText}>
                    {isAvailable ? "Add to Cart" : "Unavailable"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={36} color={COLORS.muted} style={{marginBottom: 10}}/>
            <Text style={styles.emptyTitle}>Wishlist is empty</Text>
            <Text style={styles.emptyText}>
              Save products from the marketplace to see them here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // --- General Layout ---
  container: {
    flex: 1,
    // IMPROVEMENT: Soft green background
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
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  // --- Clear Button ---
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  // --- Action Message ---
  actionMessage: {
    fontSize: 14,
    fontWeight: "600",
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
  // --- Wishlist Card ---
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 16,
    marginBottom: 15,
    ...SHADOWS.card,
    borderLeftWidth: 5,
    borderColor: COLORS.danger, // Use danger color for the heart theme
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  imageWrapper: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
    overflow: "hidden",
    marginRight: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeUnavailable: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  detailsColumn: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 13,
    color: COLORS.muted,
    marginRight: 8,
  },
  priceText: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
  },
  supplierText: {
    fontSize: 12,
    color: COLORS.mutedDark,
    marginTop: 4,
  },
  // --- Actions Row ---
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    ...SHADOWS.soft,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.muted,
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.danger, // Use danger theme for removal action
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: {
    color: COLORS.danger,
    fontWeight: "700",
    fontSize: 14,
  },
  // --- Empty State ---
  emptyState: {
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
    marginTop: 20,
    marginHorizontal: 16,
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
  // --- Utility ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#F0FFF0',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.mutedDark,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.mutedDark,
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 15,
  },
});