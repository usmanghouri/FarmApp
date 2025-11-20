import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons, Feather } from '@expo/vector-icons'; // For icons
import * as Location from 'expo-location'; // Library for geolocation

// APIs: GET /api/weather/:city, GET /api/weather/alerts/user

export default function WeatherAlertsScreen() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // --- NEW: Function to get location and reverse geocode (Conceptual) ---
  const getCurrentCity = async () => {
    try {
      // 1. Request foreground permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Permission to access location was denied. Showing default weather for Lahore.");
        return "Lahore"; 
      }

      // 2. Get current position
      let location = await Location.getCurrentPositionAsync({});
      
      // 3. Reverse Geocode (Conceptual - converts lat/long to city name)
      // NOTE: Expo Location.reverseGeocodeAsync is the actual implementation
      let address = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
      });
      
      const cityName = address[0]?.city || "Lahore";
      return cityName;

    } catch (e) {
      console.error("Location or Geocoding Error:", e);
      return "Lahore"; // Fallback
    }
  };
  // --- END NEW LOCATION LOGIC ---

  const fetchData = async (cityName = city) => {
    try {
      setError("");
      setRefreshing(true);
      setLoading(false); // Keep loading state if refreshing

      const [weatherRes, alertsRes] = await Promise.all([
        apiClient.get(`/api/weather/${cityName}`, { withCredentials: true }),
        apiClient.get("/api/weather/alerts/user", { withCredentials: true })
      ]);
      setWeather(weatherRes.data?.data || null);
      setAlerts(alertsRes.data?.alerts || []);
      setCity(cityName);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load weather";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeWeather = async () => {
        const initialCity = await getCurrentCity();
        await fetchData(initialCity);
    };
    initializeWeather();
  }, []); // Run only on mount

  const WeatherMetric = ({ label, value, icon }) => (
    <View style={styles.metricCard}>
      <Feather name={icon} size={16} color={COLORS.primary} style={styles.metricIcon} />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchData(city)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.heading}>Weather & Alerts</Text>

      {/* City Search/Update */}
      <View style={styles.cityRow}>
        <Feather name="search" size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.cityInput}
          value={city}
          onChangeText={setCity}
          placeholder="Enter city or location"
          placeholderTextColor={COLORS.muted}
          // Added logic to perform search on Enter key press
          onSubmitEditing={() => fetchData(city)} 
        />
        <TouchableOpacity style={styles.primaryButton} onPress={() => fetchData(city)} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Feather name="refresh-cw" size={20} color={COLORS.surface} />
          )}
        </TouchableOpacity>
      </View>

      {weather ? (
        // --- Current Weather Card ---
        <View style={styles.weatherCard}>
          <View style={styles.weatherHeaderRow}>
            <Ionicons name="location-sharp" size={24} color={COLORS.primaryDark} />
            <Text style={styles.weatherCity}>{city}</Text>
          </View>
          
          <View style={styles.mainWeatherDisplay}>
            <Ionicons 
                name={weather.description?.toLowerCase().includes('rain') ? 'rainy-outline' : 'sunny-outline'} 
                size={70} 
                color={COLORS.primary} 
            />
            <View>
                <Text style={styles.weatherTemp}>
                  {weather.temperature?.toFixed(0)}°C
                </Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
            </View>
          </View>
          
          <View style={styles.metricsRow}>
            <WeatherMetric 
                label="Humidity" 
                value={`${weather.humidity}%`} 
                icon="droplet" 
            />
            <WeatherMetric 
                label="Wind Speed" 
                value={`${weather.windSpeed} km/h`} 
                icon="wind" 
            />
            <WeatherMetric 
                label="Feels Like" 
                value={`${weather.feelsLike}°C`} 
                icon="thermometer" 
            />
          </View>
        </View>
      ) : null}

      {/* --- Alerts Card --- */}
      <View style={styles.alertsCard}>
        <Text style={styles.sectionTitle}>
            <Ionicons name="warning-outline" size={18} color={COLORS.danger} /> Farm Alerts
        </Text>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>No severe weather alerts active for your region.</Text>
        ) : (
          alerts.map((alert, index) => (
            <View key={index} style={[styles.alertItem, { borderLeftColor: COLORS.warning }]}>
              <Text style={styles.alertTitle}>{alert.alert}</Text>
              <Text style={styles.alertCity}>
                {alert.city} • {alert.description}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    // IMPROVEMENT: Soft green background
    backgroundColor: '#F0FFF0', 
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 18,
  },
  // --- City Input/Search ---
  cityRow: {
    flexDirection: "row",
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 10,
    ...SHADOWS.soft,
  },
  searchIcon: {
      marginRight: 10,
  },
  cityInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.mutedDark,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
  },
  // --- Weather Card ---
  weatherCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 20,
    ...SHADOWS.card,
    borderTopWidth: 5,
    borderColor: COLORS.primary, // Themed top border
  },
  weatherHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  weatherCity: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  mainWeatherDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 20,
      gap: 15,
  },
  weatherTemp: {
    fontSize: 56, // Larger temperature
    fontWeight: "900",
    color: COLORS.primaryDark,
  },
  weatherDesc: {
    fontSize: 18,
    color: COLORS.mutedDark,
  },
  // --- Metrics ---
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.background, // Use soft background for metrics
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    marginHorizontal: 4,
    gap: 5,
  },
  metricIcon: {
      marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.muted,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.mutedDark,
  },
  // --- Alerts Card ---
  alertsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    ...SHADOWS.soft,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertItem: {
    borderLeftWidth: 4,
    paddingLeft: 15,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#FFFBEB', // Light yellow background
    borderRadius: RADIUS.md,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.warning,
  },
  alertCity: {
    fontSize: 13,
    color: COLORS.mutedDark,
    marginTop: 4,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
  },
  // --- Utility ---
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
    fontSize: 16,
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
  },
});