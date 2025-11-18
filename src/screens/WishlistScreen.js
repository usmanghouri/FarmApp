import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Image
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

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

  const removeItem = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.delete(
        `/api/wishlist/item/${productId}`,
        { withCredentials: true }
      );
      setItems((prev) => prev.filter((item) => item.productId?._id !== productId));
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to remove item";
      setActionMessage(msg);
    }
  };

  const clearWishlist = async () => {
    try {
      setActionMessage("");
      await apiClient.delete(
        "/api/wishlist/clear",
        { withCredentials: true }
      );
      setItems([]);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to clear wishlist";
      setActionMessage(msg);
    }
  };

  const addToCart = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.post(
        "/api/wishlist/addtocart",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      setActionMessage("Added to cart");
      fetchWishlist();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to add to cart";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
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
        <Text style={styles.heading}>My Wishlist</Text>
        {items.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearWishlist}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => {
          const product = item.productId || {};
          const imageUrl = product.images?.[0];
          return (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.imageWrapper}>
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imagePlaceholderText}>No image</Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productMeta}>
                    {product.category} • {product.unit}
                  </Text>
                  <Text style={styles.productMeta}>
                    Supplier: {product.upLoadedBy?.uploaderName || "Unknown"}
                  </Text>
                  <Text style={styles.priceText}>
                    Rs. {(product.price || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.infoText}>
                    Added on: {new Date(item.addedAt).toLocaleDateString()}
                  </Text>
                  <Text style={styles.infoText}>
                    Available: {product.isAvailable ? "Yes" : "No"}
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
                  style={styles.primaryButton}
                  onPress={() => addToCart(product._id)}
                >
                  <Text style={styles.primaryButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Wishlist empty</Text>
            <Text style={styles.emptyText}>
              Save products to your wishlist to see them here.
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
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.danger
  },
  clearButtonText: {
    color: COLORS.danger,
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
    padding: 14,
    marginBottom: 12,
    ...SHADOWS.card
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    overflow: "hidden",
    marginRight: 12
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
  imagePlaceholderText: {
    fontSize: 10,
    color: COLORS.muted
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.mutedDark
  },
  productMeta: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2
  },
  priceText: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.primary
  },
  infoText: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 8
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontWeight: "600",
    fontSize: 13
  },
  secondaryButton: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background
  },
  secondaryButtonText: {
    color: COLORS.mutedDark,
    fontWeight: "600",
    fontSize: 13
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
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


