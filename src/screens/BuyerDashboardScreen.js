import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// Mobile version of src/pages/BuyerDashboard.jsx
// Shows key stats and quick navigation tiles to the same destinations
// as the web dashboard cards and links.

export default function BuyerDashboardScreen({ navigation }) {
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading buyer dashboard...</Text>
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Buyer Dashboard</Text>

      {/* Stats cards */}
      <View style={styles.cardRow}>
        <StatCard label="My Orders" value={ordersCount} />
        <StatCard label="Wishlist" value={wishlistCount} />
      </View>
      <View style={styles.cardRow}>
        <StatCard label="Cart Items" value={cartCount} />
      </View>

      {/* Recent Orders Section */}
      <Text style={styles.sectionTitle}>Recent Orders</Text>
      <View style={styles.recentOrdersContainer}>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderItem}
              onPress={() => navigation.navigate("OrderDetail", { orderId: order._id })}
            >
              <View>
                <Text style={styles.orderId}>Order #{order._id.slice(-6)}</Text>
                <Text style={styles.orderMeta}>
                  {order.products.length} item{order.products.length !== 1 ? "s" : ""} |{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.orderStatus,
                  order.status === "delivered"
                    ? styles.statusDelivered
                    : order.status === "shipped"
                    ? styles.statusShipped
                    : styles.statusPending,
                ]}
              >
                {order.status}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>No recent orders found.</Text>
        )}
      </View>

      {/* Recommended Products Section */}
      <Text style={styles.sectionTitle}>Recommended Products</Text>
      <View style={styles.recommendedProductsContainer}>
        {recommendedProducts.length > 0 ? (
          recommendedProducts.map((product) => (
            <TouchableOpacity
              key={product._id}
              style={styles.productItem}
              onPress={() => navigation.navigate("ProductDetail", { productId: product._id })}
            >
              <Image
                source={{ uri: product.images[0] || "https://via.placeholder.com/50" }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productCategory}>{product.category}</Text>
                <Text style={styles.productPrice}>₨ {product.price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>No recommended products found.</Text>
        )}
      </View>

      {/* Quick navigation tiles mirroring the web buyer dashboard */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <ActionTile
          label="Browse Products"
          description="View marketplace"
          onPress={() => navigation.navigate("BuyerProducts")}
        />
        <ActionTile
          label="My Cart"
          description="Checkout items"
          onPress={() => navigation.navigate("BuyerCart")}
        />
        <ActionTile
          label="My Orders"
          description="Order history"
          onPress={() => navigation.navigate("MyOrders")}
        />
        <ActionTile
          label="Wishlist"
          description="Saved products"
          onPress={() => navigation.navigate("Wishlist")}
        />
        <ActionTile
          label="Profile"
          description="Buyer profile"
          onPress={() => navigation.navigate("BuyerProfile")}
        />
      </View>
    </ScrollView>
  );
}

const StatCard = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const ActionTile = ({ label, description, onPress }) => (
  <TouchableOpacity style={styles.actionTile} onPress={onPress}>
    <Text style={styles.actionLabel}>{label}</Text>
    {description ? <Text style={styles.actionDescription}>{description}</Text> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.background,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 20,
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
    borderRadius: RADIUS.md,
    padding: 18,
    ...SHADOWS.card,
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: 6,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.mutedDark,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primaryDark,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionTile: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 15,
    marginBottom: 15,
    ...SHADOWS.soft,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 4,
    textAlign: "center",
  },
  actionDescription: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
  },
  recentOrdersContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  orderMeta: {
    fontSize: 12,
    color: COLORS.muted,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: RADIUS.sm,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
    color: COLORS.warningDark,
  },
  statusShipped: {
    backgroundColor: COLORS.infoLight,
    color: COLORS.infoDark,
  },
  statusDelivered: {
    backgroundColor: COLORS.successLight,
    color: COLORS.successDark,
  },
  noDataText: {
    textAlign: "center",
    color: COLORS.muted,
    fontStyle: "italic",
    paddingVertical: 10,
  },
  recommendedProductsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.card,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.sm,
    ...SHADOWS.soft,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    marginRight: 15,
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primaryDark,
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.primary,
  },
});


