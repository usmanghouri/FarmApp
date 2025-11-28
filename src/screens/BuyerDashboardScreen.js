import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations/translations";
import ChatBotButton from "../components/ChatBotButton";

// --- Custom Components ---

// Action Icon Mapping
const ACTION_ICONS = {
  "Browse Products": "basket-outline",
  "My Cart": "cart-outline",
  "My Orders": "list-circle-outline",
  "Wishlist": "heart-outline",
  "Profile": "person-circle-outline",
  "Market Insights": "stats-chart-outline", // Added for clarity
};

// StatCard Component (Enhanced with Icons and Colors)
const StatCard = ({ label, value, iconName, color }) => (
  <View style={[styles.card, { backgroundColor: color || COLORS.surface, borderLeftColor: COLORS.primary, borderLeftWidth: 5 }]}>
    <Ionicons name={iconName} size={28} color={COLORS.primary} style={styles.cardIcon} />
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

// ActionTile Component (Enhanced with Icons)
const ActionTile = ({ label, description, onPress, iconKey }) => (
  <TouchableOpacity style={styles.actionTile} onPress={onPress}>
    <Ionicons 
      name={ACTION_ICONS[iconKey || label] || 'cube-outline'} 
      size={30} 
      color={COLORS.primaryDark} 
    />
    <Text style={styles.actionLabel}>{label}</Text>
    {description ? <Text style={styles.actionDescription}>{description}</Text> : null}
  </TouchableOpacity>
);

// --- Main Component ---

export default function BuyerDashboardScreen({ navigation }) {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].buyerDashboard;
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const ordersRes = await apiClient.get(
          "/api/v1/order/user-orders",
          { withCredentials: true }
        );
        setOrdersCount(ordersRes.data?.orders?.length || 0);
        setRecentOrders(ordersRes.data.orders?.slice(0, 3) || []);

        const wishlistRes = await apiClient.get(
          "/api/wishlist/my-wishlist",
          { withCredentials: true }
        );
        setWishlistCount(wishlistRes.data?.wishlist?.products?.length || 0);

        const cartRes = await apiClient.get(
          "/api/cart/my-cart",
          { withCredentials: true }
        );
        setCartCount(cartRes.data?.cart?.products?.length || 0);

        const productsResponse = await apiClient.get(
          "/api/products/all",
          { withCredentials: true }
        );
        setRecommendedProducts(
            productsResponse.data.products?.slice(0, 4) || []
        );

      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to load data";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Utility to map status to color
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered') return { bg: COLORS.success, text: COLORS.surface };
    if (s === 'shipped') return { bg: COLORS.info, text: COLORS.surface };
    if (s === 'canceled' || s === 'cancelled') return { bg: COLORS.danger, text: COLORS.surface };
    return { bg: COLORS.warning, text: COLORS.primaryDark };
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  if (error) {
    const commonT = translations[language];
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>{commonT.error}</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0FFF0' }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primaryDark} />
      
      {/* --- Custom Header --- */}
      <View style={styles.header}>
        {/* Language Toggle Button */}
        <TouchableOpacity 
          onPress={toggleLanguage}
          style={styles.languageButton}
        >
          <Text style={styles.languageText}>{language === "en" ? "اردو" : "EN"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate("BuyerProfile")}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={30} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.welcomeText}>{t.welcome}</Text>

        {/* --- Stats Cards --- */}
        <View style={styles.cardSection}>
            <View style={styles.cardRow}>
                <StatCard 
                    label={t.totalOrders} 
                    value={ordersCount} 
                    iconName="receipt-outline"
                    color={COLORS.surface}
                />
                <StatCard 
                    label={t.wishlistItems} 
                    value={wishlistCount} 
                    iconName="heart-outline"
                    color={COLORS.surface}
                />
            </View>
            <View style={styles.cardRow}>
                <StatCard 
                    label={t.itemsInCart} 
                    value={cartCount} 
                    iconName="cart-outline"
                    color={COLORS.surface}
                    style={{ flex: 0.5, marginRight: 10 }}
                />
            </View>
        </View>

        {/* --- Recent Orders Section --- */}
        <Text style={styles.sectionTitle}>{t.recentOrders}</Text>
        <View style={styles.recentOrdersContainer}>
            {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                    const statusStyle = getStatusColor(order.status);
                    return (
                        <TouchableOpacity
                            key={order._id}
                            style={styles.orderItem}
                            onPress={() => navigation.navigate("OrderDetail", { orderId: order._id })}
                        >
                            <Feather name="package" size={18} color={COLORS.primaryDark} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                                <Text style={styles.orderMeta}>
                                    {order.products.length} item{order.products.length !== 1 ? "s" : ""} | {new Date(order.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.orderStatusBadge,
                                    { backgroundColor: statusStyle.bg },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.orderStatusText,
                                        { color: statusStyle.text }
                                    ]}
                                >
                                    {order.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })
            ) : (
                <Text style={styles.noDataText}>{t.noRecentOrders}</Text>
            )}
        </View>

        {/* --- Recommended Products Section --- */}
        <Text style={styles.sectionTitle}>{t.recommendedForYou}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 20}}>
            {recommendedProducts.length > 0 ? (
                recommendedProducts.map((product) => (
                    <TouchableOpacity
                        key={product._id}
                        style={styles.productItem}
                        onPress={() => navigation.navigate("BuyerProducts", { productId: product._id })}
                    >
                        <Image
                            source={{ uri: product.images?.[0] || "https://via.placeholder.com/50" }}
                            style={styles.productImage}
                        />
                        <View style={styles.productInfo}>
                            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                            <Text style={styles.productPrice}>₨ {product.price.toLocaleString()}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.noDataText}>{t.noRecommendedProducts}</Text>
            )}
        </ScrollView>

        {/* --- Quick Actions Grid --- */}
        <Text style={styles.sectionTitle}>{t.quickAccess}</Text>
        <View style={styles.actionsGrid}>
            <ActionTile iconKey="Browse Products" label={t.browseProducts} description={t.browseProductsDesc} onPress={() => navigation.navigate("BuyerProducts")} />
            <ActionTile iconKey="My Cart" label={t.myCart} description={t.myCartDesc} onPress={() => navigation.navigate("BuyerCart")} />
            <ActionTile iconKey="My Orders" label={t.myOrders} description={t.myOrdersDesc} onPress={() => navigation.navigate("MyOrders")} /> 
            <ActionTile iconKey="Wishlist" label={t.wishlist} description={t.wishlistDesc} onPress={() => navigation.navigate("Wishlist")} />
            <ActionTile iconKey="Profile" label={t.profile} description={t.profileDesc} onPress={() => navigation.navigate("BuyerProfile")} />
            {/* <ActionTile iconKey="Market Insights" label={t.marketInsights} description={t.marketInsightsDesc} onPress={() => navigation.navigate("MarketInsights")} /> */}
        </View>
        
      </ScrollView>
      
      {/* ChatBot Button */}
      <ChatBotButton onPress={() => navigation.navigate("ChatBot")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- General Layout & Header ---
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0FFF0', // Soft green background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primaryDark,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    ...SHADOWS.dark,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.surface,
    flex: 1,
    textAlign: 'center',
  },
  languageButton: {
    padding: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginRight: 10,
  },
  languageText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
  menuButton: {
    padding: 5,
  },
  profileButton: { 
    padding: 5,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  // --- Stats Cards ---
  cardSection: {
      marginBottom: 30,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    ...SHADOWS.card,
  },
  cardIcon: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 4,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  // --- Section Headings ---
  sectionTitle: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  // --- Recent Orders ---
  recentOrdersContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...SHADOWS.soft,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  orderInfo: {
      flex: 1,
      marginLeft: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  orderMeta: {
    fontSize: 13,
    color: COLORS.muted,
  },
  orderStatusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: RADIUS.pill,
  },
  orderStatusText: {
    fontSize: 13,
    fontWeight: "700",
  },
  // --- Recommended Products ---
  recommendedProductsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  productItem: {
    width: 150,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 10,
    marginRight: 10,
    ...SHADOWS.soft,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: COLORS.accent,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: RADIUS.md,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 2,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  // --- Quick Actions ---
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionTile: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 20,
    marginBottom: 15,
    ...SHADOWS.soft,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "space-between",
    borderLeftWidth: 5,
    borderColor: COLORS.info, // Use info color for navigation
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginTop: 8,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
  },
  // --- Utility ---
  noDataText: {
    textAlign: "center",
    color: COLORS.muted,
    fontStyle: "italic",
    paddingVertical: 10,
    width: '100%',
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: '#F0FFF0',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.mutedDark,
    fontSize: 15,
  },
  errorTitle: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    color: COLORS.mutedDark,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
    marginTop: 5,
  },
});