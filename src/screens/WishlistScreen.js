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
    width: 90,
    height: 90,
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
  infoText: {
    fontSize: 11,
    color: "#6b7280"
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12
  },
  primaryButton: {
    backgroundColor: "#166534",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  secondaryButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#d1d5db"
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600"
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280",
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


