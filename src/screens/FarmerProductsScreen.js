import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile version of src/pages/FarmerProducts.jsx
// Uses the same APIs:
//  - GET  /api/products/productForFarmer
//  - POST /api/cart/add
//  - POST /api/wishlist/add

const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "fruits", name: "Fruits" },
  { id: "vegetables", name: "Vegetables" },
  { id: "crops", name: "Crops" },
  { id: "pesticides", name: "Pesticides" },
  { id: "fertilizer", name: "Fertilizer" }
];

export default function FarmerProductsScreen() {
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await apiClient.get(
          "/api/products/productForFarmer",
          { withCredentials: true }
        );
        setProducts(res.data?.products || []);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Failed to load products";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (products || []).filter(p => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const matchesSearch =
        !term || name.includes(term) || desc.includes(term) || cat.includes(term);
      const matchesCategory =
        activeCategory === "all" || cat.includes(activeCategory.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  const addToCart = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.post(
        "/api/cart/add",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      setActionMessage("Added to cart");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to add to cart";
      setActionMessage(msg);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.post(
        "/api/wishlist/add",
        { productId },
        { withCredentials: true }
      );
      setWishlistIds(prev => [...prev, productId]);
      setActionMessage("Added to wishlist");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to add to wishlist";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error loading products</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Browse Products</Text>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      {/* Category chip row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryRow}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              activeCategory === cat.id && styles.categoryChipActive
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      {/* Product grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const imageUrl = item.images?.[0];
          const inWishlist = wishlistIds.includes(item._id);
          return (
            <View style={styles.card}>
              <View style={styles.imageWrapper}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imagePlaceholderText}>No image</Text>
                  </View>
                )}
                {!item.isAvailable && (
                  <View style={styles.badgeOut}>
                    <Text style={styles.badgeOutText}>Out of stock</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={() => addToWishlist(item._id)}
                >
                  <Text style={{ color: inWishlist ? "red" : "#6b7280" }}>
                    ♥
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderRow}>
                  <Text
                    style={styles.productName}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.quantityBadge}>
                    {item.quantity} {item.unit}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    Rs. {Number(item.price || 0).toLocaleString()}
                  </Text>
                  {item.category ? (
                    <Text style={styles.categoryBadge}>
                      {item.category}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={styles.descriptionText}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={[
                      styles.cartButton,
                      !item.isAvailable && styles.cartButtonDisabled
                    ]}
                    onPress={() => addToCart(item._id)}
                    disabled={!item.isAvailable}
                  >
                    <Text style={styles.cartButtonText}>
                      {item.isAvailable ? "Add to Cart" : "Unavailable"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or category filters.
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
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.background
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12
  },
  searchContainer: {
    marginBottom: 8
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    fontSize: 14
  },
  categoryRow: {
    marginVertical: 8
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: "#e5e7eb",
    marginRight: 8
  },
  categoryChipActive: {
    backgroundColor: "#16a34a"
  },
  categoryText: {
    fontSize: 13,
    color: "#374151"
  },
  categoryTextActive: {
    color: "#ffffff"
  },
  actionMessage: {
    fontSize: 12,
    color: "#16a34a",
    marginBottom: 4
  },
  listContent: {
    paddingBottom: 16
  },
  columnWrapper: {
    justifyContent: "space-between"
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    width: "48%",
    overflow: "hidden",
    ...SHADOWS.card
  },
  imageWrapper: {
    height: 120,
    backgroundColor: "#e5e7eb"
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
    fontSize: 12,
    color: "#9ca3af"
  },
  badgeOut: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999
  },
  badgeOutText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600"
  },
  wishlistButton: {
    position: "absolute",
    top: 6,
    left: 6,
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 4
  },
  quantityBadge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 999
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a"
  },
  categoryBadge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    borderRadius: 999
  },
  descriptionText: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6
  },
  footerRow: {
    alignItems: "center"
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 6,
    alignItems: "center"
  },
  cartButtonDisabled: {
    backgroundColor: "#9ca3af"
  },
  cartButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600"
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
    fontSize: 16,
    fontWeight: "600",
    color: "#b91c1c",
    marginBottom: 4
  },
  errorText: {
    fontSize: 13,
    color: "#4b5563",
    textAlign: "center"
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
  }
});


