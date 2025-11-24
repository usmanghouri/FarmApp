import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../translations/translations";

// --- Custom Components ---

// Action Icon Mapping (Aligned with Supplier focus)
const ACTION_ICONS = {
  "Orders": "cube-outline",
  "Products": "leaf-outline",
  "Weather": "cloudy-night-outline",
  "Profile": "person-circle-outline",
  "Market Insights": "stats-chart-outline",
  "Support": "help-circle-outline",
};

// Utility to map order status to color (reused from OrderManagement)
const getStatusColor = (status) => {
  const s = status?.toLowerCase();
  if (s === 'delivered') return { bg: COLORS.success, text: COLORS.surface };
  if (s === 'shipped') return { bg: COLORS.info, text: COLORS.surface };
  if (s === 'canceled' || s === 'cancelled') return { bg: COLORS.danger, text: COLORS.surface };
  return { bg: COLORS.warning, text: COLORS.primaryDark };
};

// StatCard Component (Enhanced with Icons and Colors)
const StatCard = ({ label, value, subtitle, iconName, color }) => (
  <View style={[styles.card, { backgroundColor: color || COLORS.surface, borderLeftColor: COLORS.primary, borderLeftWidth: 5 }]}>
    <Ionicons name={iconName} size={28} color={COLORS.primary} style={styles.cardIcon} />
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
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

export default function SupplierDashboardScreen({ navigation }) {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language].supplierDashboard;
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const ordersResponse = await apiClient.get(
          "/api/v1/order/supplier-orders",
          { withCredentials: true }
        );
        
        const allOrders = ordersResponse.data?.orders || [];
        const activeOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        setActiveOrdersCount(activeOrders);

        setRecentOrders(allOrders.slice(0, 3));

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = allOrders.reduce((sum, order) => {
          if (
            order.status === "delivered" &&
            new Date(order.createdAt).getMonth() === currentMonth &&
            new Date(order.createdAt).getFullYear() === currentYear
          ) {
            return sum + (order.totalPrice || 0);
          }
          return sum;
        }, 0);
        setRevenue(monthlyRevenue);

        const productsResponse = await apiClient.get(
          "/api/products/my_product",
          { withCredentials: true }
        );
        setProductsCount(productsResponse.data?.products?.length || 0);
      } catch (err) {
        const msg =
          err?.response?.data?.message || err.message || "Failed to load data";
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
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>{t.loading}</Text>
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
          onPress={() => navigation.navigate("SupplierProfile")}
          style={styles.profileButton}
        >
          <Ionicons name="person-circle-outline" size={30} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.welcomeText}>{t.welcome}</Text>

        {/* --- Stats cards --- */}
        <View style={styles.cardSection}>
            <View style={styles.cardRow}>
                <StatCard 
                    label={t.activeOrders} 
                    value={activeOrdersCount} 
                    iconName="time-outline"
                    color={COLORS.surface}
                />
                <StatCard 
                    label={t.productsListed} 
                    value={productsCount} 
                    iconName="leaf-outline"
                    color={COLORS.surface}
                />
            </View>
            <View style={styles.cardRow}>
                <StatCard 
                    label={`${t.revenue} (${new Date().toLocaleString('default', { month: 'short' })})`} 
                    value={`Rs. ${revenue.toLocaleString()}`} 
                    iconName="cash-outline"
                    color={COLORS.surface}
                />
                {/* Mocked Weather Status Card */}
                <StatCard 
                    label={t.weatherStatus} 
                    value="Optimal" 
                    subtitle="30°C / Light Wind" 
                    iconName="cloudy-night-outline"
                    color={COLORS.surface}
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
                            <Feather name="truck" size={18} color={COLORS.primaryDark} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderId}>Order #{order._id?.slice(-6).toUpperCase()}</Text>
                                <Text style={styles.orderMeta}>
                                    {order.products[0]?.name || "N/A"} | Items: {order.products.length}
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

        {/* --- Quick Actions Grid --- */}
        <Text style={styles.sectionTitle}>{t.quickActions}</Text>
        <View style={styles.actionsGrid}>
            <ActionTile iconKey="Orders" label={t.orders} description={t.ordersDesc} onPress={() => navigation.navigate("OrderManagement")} />
            <ActionTile iconKey="Products" label={t.products} description={t.productsDesc} onPress={() => navigation.navigate("ProductManagement")} />
            <ActionTile iconKey="Weather" label={t.weather} description={t.weatherDesc} onPress={() => navigation.navigate("WeatherAlerts")} />
            <ActionTile iconKey="Profile" label={t.profile} description={t.profileDesc} onPress={() => navigation.navigate("SupplierProfile")} />
            <ActionTile iconKey="Market Insights" label={t.marketInsights} description={t.marketInsightsDesc} onPress={() => navigation.navigate("MarketInsights")} />
            <ActionTile iconKey="Support" label={t.support} description={t.supportDesc} onPress={() => console.log('Support')} /> 
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

// Stylesheet remains the same with necessary theme application and structural adjustments
const styles = StyleSheet.create({
  // --- Header Styles ---
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0FFF0', // Soft green background
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  // --- Stats Card Styles ---
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
    borderLeftWidth: 5,
    borderColor: COLORS.primary,
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
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },
  // --- Recent Orders ---
  sectionTitle: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
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
    borderColor: COLORS.info,
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
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 16,
    paddingHorizontal: 20,
  },
});