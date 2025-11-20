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
  ScrollView,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons } from '@expo/vector-icons'; 

// Mobile version of src/pages/FarmerProducts.jsx

const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "fruits", name: "Fruits" },
  { id: "vegetables", name: "Vegetables" },
  { id: "crops", name: "Crops" },
  { id: "pesticides", name: "Pesticides" },
  { id: "fertilizer", name: "Fertilizer" },
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

        // Fetch wishlist IDs if necessary
        
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

  const triggerActionMessage = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 2000);
  };

  const addToCart = async (productId) => {
    try {
      await apiClient.post(
        "/api/cart/add",
        { productId, quantity: 1 },
        { withCredentials: true }
      );
      triggerActionMessage("Product added to cart successfully!");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to add to cart";
      triggerActionMessage(msg);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const isCurrentlyInWishlist = wishlistIds.includes(productId);
      
      await apiClient.post( 
        "/api/wishlist/add",
        { productId },
        { withCredentials: true }
      );
      
      if (isCurrentlyInWishlist) {
        setWishlistIds(prev => prev.filter(id => id !== productId));
        triggerActionMessage("Removed from wishlist.");
      } else {
        setWishlistIds(prev => [...prev, productId]);
        triggerActionMessage("Added to wishlist!");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to modify wishlist";
      triggerActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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
      <Text style={styles.heading}>Marketplace Products</Text>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search products, category or unit..."
          placeholderTextColor={COLORS.muted}
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
                    <Ionicons name="image-outline" size={30} color={COLORS.muted} />
                    <Text style={styles.imagePlaceholderText}>No image</Text>
                  </View>
                )}
                
                {/* Out of Stock Badge */}
                {!item.isAvailable && (
                  <View style={styles.badgeOut}>
                    <Text style={styles.badgeOutText}>OUT OF STOCK</Text>
                  </View>
                )}
                
                {/* Wishlist Button (FIXED) */}
                <TouchableOpacity
                  style={styles.wishlistButton}
                  onPress={() => addToWishlist(item._id)}
                >
                  <Ionicons 
                    name={inWishlist ? "heart" : "heart-outline"} // Toggled Icon
                    size={24}
                    color={inWishlist ? COLORS.danger : COLORS.muted} // Toggled Color
                  />
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
  // --- Global Container ---
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    // IMPROVEMENT: Soft green background for the screen
    backgroundColor: '#F0FFF0', 
  },
  heading: {
    fontSize: 24, 
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  // --- Search Bar ---
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill, 
    paddingHorizontal: 18,
    paddingVertical: 10, 
    backgroundColor: COLORS.surface,
    fontSize: 15,
    color: COLORS.mutedDark,
  },
  // --- Category Chips (FIXED) ---
 categoryRow: {
    marginVertical: 8,
    marginBottom: 16,
    paddingHorizontal: 5, // Added padding to give chips breathing room from edges
  },
  categoryChip: {
    // INCREASED padding for a more uniform, button-like appearance
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: RADIUS.pill,
    // Soft, slightly visible background for inactive chips
    backgroundColor: '#E7EBE8', 
    marginRight: 10, // Increased margin for visual separation
    // Ensure the chip layout respects its content exactly
    // (This is the default but good to verify if you run into flex issues)
    alignSelf: 'flex-start', 
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary, // Primary color for active chip
    // Add subtle lift/shadow to the active chip
    ...SHADOWS.soft, 
    elevation: 3, // Android lift
  },
  categoryText: {
    fontSize: 14, // Slightly larger font size
    // PrimaryDark for high contrast against the light chip background
    color: COLORS.primaryDark, 
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.surface, // White text for active
    fontWeight: '700', // Bolder font
  },
  actionMessage: {
    fontSize: 14,
    color: COLORS.success, 
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  // --- Product Grid ---
  listContent: {
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, 
    marginBottom: 16,
    width: "48%",
    overflow: "hidden",
    ...SHADOWS.soft, 
  },
  // --- Image Area ---
  imageWrapper: {
    height: 140, 
    backgroundColor: COLORS.border, 
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholderText: {
    fontSize: 13,
    color: COLORS.muted,
  },
  badgeOut: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: COLORS.danger, 
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  badgeOutText: {
    color: COLORS.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  wishlistButton: {
    position: "absolute",
    top: 10,
    left: 10,
    padding: 6,
    backgroundColor: COLORS.surface, 
    borderRadius: RADIUS.pill,
    ...SHADOWS.soft,
  },
  // --- Card Body ---
  cardBody: {
    paddingHorizontal: 12, 
    paddingVertical: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.mutedDark,
    flex: 1,
    marginRight: 6,
  },
  quantityBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.accent, 
    color: COLORS.primaryDark,
    borderRadius: RADIUS.pill,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary, 
  },
  categoryBadge: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.info,
    color: COLORS.surface,
    borderRadius: RADIUS.pill,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 10,
    lineHeight: 16,
  },
  footerRow: {
    alignItems: "stretch", 
  },
  cartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingVertical: 8, 
    alignItems: "center",
  },
  cartButtonDisabled: {
    backgroundColor: COLORS.muted, 
  },
  cartButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "700",
  },
  // --- Utility Styles ---
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: '#F0FFF0',
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.mutedDark,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    textAlign: "center",
  },
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
});