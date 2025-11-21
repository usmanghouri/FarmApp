import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from '@expo/vector-icons';

// --- Static Data (From React JS Reference) ---
const CATEGORIES = [
  { id: "all", name: "All Products" },
  { id: "fruits", name: "Fruits" },
  { id: "vegetables", name: "Vegetables" },
  { id: "crops", name: "Crops" },
  { id: "pesticides", name: "Pesticides" },
  { id: "fertilizer", name: "Fertilizer" },
];
// --- End Static Data ---


export default function BuyerProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // --- NEW STATE for Search and Filter ---
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all"); 
  // --- End NEW STATE ---

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/products/all", { withCredentials: true });
      setProducts(response.data.products); 
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await apiClient.post("/api/cart/add-item", { productId, quantity: 1 }, { withCredentials: true });
      Alert.alert("Success", "Product added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      Alert.alert("Error", err.response?.data?.message || "Failed to add to cart.");
    }
  };
  
  // --- NEW: Filtered Products Logic ---
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";

        const matchesSearch =
            name.includes(term) ||
            description.includes(term) ||
            category.includes(term);

        const matchesCategory =
            activeCategory === "all" || category.includes(activeCategory.toLowerCase());

        return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);
  // --- End NEW Logic ---

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={[styles.productCard, !item.isAvailable && styles.cardUnavailable]}
      onPress={() => navigation.navigate("ProductDetail", { productId: item._id })}
      disabled={!item.isAvailable}
    >
      <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: item.images?.[0] || "https://via.placeholder.com/150" }} 
            style={styles.productImage} 
          />
          {!item.isAvailable && (
              <View style={styles.stockOverlay}>
                  <Text style={styles.stockOverlayText}>OUT OF STOCK</Text>
              </View>
          )}
      </View>
      
      <View style={styles.productInfo}>
        {/* Changed name line clamping for visual consistency */}
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text> 
        <Text style={styles.productCategory}>
            {item.category} | {item.unit}
        </Text>
        <Text style={styles.productPrice}>₨ {item.price.toLocaleString()}</Text>
        
        <TouchableOpacity 
            style={[styles.addToCartButton, !item.isAvailable && styles.disabledButton]} 
            onPress={(e) => {
                e.stopPropagation(); // Prevent card navigation when button is pressed
                handleAddToCart(item._id);
            }}
            disabled={!item.isAvailable}
        >
          <Text style={styles.addToCartButtonText}>
            {item.isAvailable ? "Add to Cart" : "Unavailable"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Marketplace</Text>
      
      {/* --- NEW: Search Bar --- */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
            placeholder="Search products, category, or seller..."
            placeholderTextColor={COLORS.muted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
        />
      </View>
      
      {/* --- NEW: Category Chips --- */}
      <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryRowScroll}
          contentContainerStyle={styles.categoryRowContainer}
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

      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
      
      {filteredProducts.length === 0 && !loading && (
          <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={50} color={COLORS.muted} />
              <Text style={styles.emptyTitle}>No products found.</Text>
              <Text style={styles.emptyText}>Adjust your search or filter.</Text>
          </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F0FFF0', // Soft green background
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 16,
  },
  // --- Search Bar ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    marginBottom: 16,
  },
  searchIcon: {
      marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.mutedDark,
  },
  // --- Category Chips ---
  categoryRowScroll: {
      maxHeight: 45,
      marginBottom: 16,
  },
  categoryRowContainer: {
      paddingHorizontal: 5,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.mutedDark,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  // --- Product Card ---
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.card,
    borderBottomWidth: 3,
    borderColor: COLORS.accent, 
  },
  cardUnavailable: {
    opacity: 0.6,
    borderColor: COLORS.danger,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
    backgroundColor: COLORS.background,
  },
  stockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockOverlayText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '800',
    padding: 10,
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.sm,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 6,
    minHeight: 40, 
  },
  productCategory: {
    fontSize: 13,
    color: COLORS.muted,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: "800",
  },
  disabledButton: {
    backgroundColor: COLORS.muted,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  // --- Utility Views ---
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.card,
    marginHorizontal: 8,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#F0FFF0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.mutedDark,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: "center",
    padding: 20,
  },
});