import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

// APIs: GET /api/weather/:city, GET /api/weather/alerts/user

export default function WeatherAlertsScreen() {
  const [city, setCity] = useState("Lahore");
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (cityName = city) => {
    try {
      setError("");
      setRefreshing(true);
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
    fetchData("Islamabad");
  }, []);

  const WeatherMetric = ({ label, value }) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Loading weather...</Text>
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

      <View style={styles.cityRow}>
        <TextInput
          style={styles.cityInput}
          value={city}
          onChangeText={setCity}
          placeholder="Enter city"
        />
        <TouchableOpacity style={styles.primaryButton} onPress={() => fetchData(city)}>
          <Text style={styles.primaryButtonText}>
            {refreshing ? "Refreshing..." : "Update"}
          </Text>
        </TouchableOpacity>
      </View>

      {weather ? (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherCity}>{city}</Text>
          <Text style={styles.weatherTemp}>
            {weather.temperature?.toFixed(1)}°C
          </Text>
          <Text style={styles.weatherDesc}>{weather.description}</Text>
          <View style={styles.metricsRow}>
            <WeatherMetric label="Humidity" value={`${weather.humidity}%`} />
            <WeatherMetric label="Wind" value={`${weather.windSpeed} km/h`} />
            <WeatherMetric label="Feels Like" value={`${weather.feelsLike}°C`} />
          </View>
        </View>
      ) : null}

      <View style={styles.alertsCard}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>No alerts for your city.</Text>
        ) : (
          alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
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
    backgroundColor: COLORS.background
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 12
  },
  cityRow: {
    flexDirection: "row",
    marginBottom: 16
  },
  cityInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  weatherCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.card
  },
  weatherCity: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280"
  },
  weatherTemp: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827"
  },
  weatherDesc: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 16
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280"
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },
  alertsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  alertItem: {
    borderLeftWidth: 3,
    borderLeftColor: "#facc15",
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#fef9c3",
    borderRadius: 8
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400e"
  },
  alertCity: {
    fontSize: 12,
    color: "#b45309"
  },
  emptyText: {
    fontSize: 13,
    color: "#6b7280"
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


