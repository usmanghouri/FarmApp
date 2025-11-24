import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import LandingScreen from "./src/screens/LandingScreen";
import AuthScreen from "./src/screens/AuthScreen";
import FarmerDashboardScreen from "./src/screens/FarmerDashboardScreen";
import BuyerDashboardScreen from "./src/screens/BuyerDashboardScreen";
import SupplierDashboardScreen from "./src/screens/SupplierDashboardScreen";
import ChatBotScreen from "./src/screens/ChatBotScreen";
import FarmerProductsScreen from "./src/screens/FarmerProductsScreen";
import ProductManagementScreen from "./src/screens/ProductManagementScreen";
import OrderManagementScreen from "./src/screens/OrderManagementScreen";
import ShoppingCartScreen from "./src/screens/ShoppingCartScreen";
import FarmerProfileScreen from "./src/screens/FarmerProfileScreen";
import WeatherAlertsScreen from "./src/screens/WeatherAlertsScreen";
import WishlistScreen from "./src/screens/WishlistScreen";
import MyOrdersScreen from "./src/screens/MyOrdersScreen";
import BuyerProductsScreen from "./src/screens/BuyerProductsScreen";
import BuyerCartScreen from "./src/screens/BuyerCartScreen";
import BuyerProfileScreen from "./src/screens/BuyerProfileScreen";
import SupplierProfileScreen from "./src/screens/SupplierProfileScreen";
import MarketPlaceScreen from "./src/screens/MarketPlaceScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";
import DeliveryTrackingScreen from "./src/screens/DeliveryTrackingScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import OrderDetailScreen from "./src/screens/OrderDetailScreen";
import MarketInsightsScreen from "./src/screens/MarketInsightsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ title: "Sign in / Sign up" }}
          />
          <Stack.Screen
            name="FarmerDashboard"
            component={FarmerDashboardScreen}
            options={{ title: "Farmer Dashboard" }}
          />
          <Stack.Screen
            name="FarmerProducts"
            component={FarmerProductsScreen}
            options={{ title: "Farmer Products" }}
          />
          <Stack.Screen
            name="ProductManagement"
            component={ProductManagementScreen}
            options={{ title: "Product Management" }}
          />
          <Stack.Screen
            name="OrderManagement"
            component={OrderManagementScreen}
            options={{ title: "Order Management" }}
          />
          <Stack.Screen
            name="ShoppingCart"
            component={ShoppingCartScreen}
            options={{ title: "Shopping Cart" }}
          />
          <Stack.Screen
            name="FarmerProfile"
            component={FarmerProfileScreen}
            options={{ title: "Farmer Profile" }}
          />
          <Stack.Screen
            name="WeatherAlerts"
            component={WeatherAlertsScreen}
            options={{ title: "Weather Alerts" }}
          />
          <Stack.Screen
            name="Wishlist"
            component={WishlistScreen}
            options={{ title: "Wishlist" }}
          />
          <Stack.Screen
            name="MyOrders"
            component={MyOrdersScreen}
            options={{ title: "My Orders" }}
          />
          <Stack.Screen
            name="BuyerDashboard"
            component={BuyerDashboardScreen}
            options={{ title: "Buyer Dashboard" }}
          />
          <Stack.Screen
            name="BuyerProducts"
            component={BuyerProductsScreen}
            options={{ title: "Buyer Products" }}
          />
          <Stack.Screen
            name="BuyerCart"
            component={BuyerCartScreen}
            options={{ title: "Buyer Cart" }}
          />
          <Stack.Screen
            name="BuyerProfile"
            component={BuyerProfileScreen}
            options={{ title: "Buyer Profile" }}
          />
          <Stack.Screen
            name="SupplierDashboard"
            component={SupplierDashboardScreen}
            options={{ title: "Supplier Dashboard" }}
          />
          <Stack.Screen
            name="SupplierProfile"
            component={SupplierProfileScreen}
            options={{ title: "Supplier Profile" }}
          />
          <Stack.Screen
            name="MarketPlace"
            component={MarketPlaceScreen}
            options={{ title: "Marketplace" }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: "Product Detail" }}
          />
          <Stack.Screen
            name="DeliveryTracking"
            component={DeliveryTrackingScreen}
            options={{ title: "Delivery Tracking" }}
          />
          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ title: "Orders" }}
          />
          <Stack.Screen
            name="OrderDetail"
            component={OrderDetailScreen}
            options={{ title: "Order Detail" }}
          />
          <Stack.Screen
            name="MarketInsights"
            component={MarketInsightsScreen}
            options={{ title: "Market Insights" }}
          />
          <Stack.Screen
            name="ChatBot"
            component={ChatBotScreen}
            options={{ title: "FarmConnect Bot" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </LanguageProvider>
    </AuthProvider>
  );
}


