import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Feather } from "@expo/vector-icons"; // Added for icons

const CLOUDINARY_UPLOAD_PRESET = "FarmConnect";
const CLOUDINARY_CLOUD_NAME = "dn5edjpzg";

const CATEGORY_OPTIONS = [
  "Fruits",
  "Vegetables",
  "Crops",
  "Pesticides",
  "Fertilizer",
  "Other",
];

const UNIT_OPTIONS = ["kg", "g", "lb", "maund", "piece"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  unit: "kg",
  quantity: "",
  category: "",
  imageUrl: "",
};

export default function ProductManagementScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionMessage, setActionMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get("/api/products/my_product", {
        withCredentials: true,
      });
      setProducts(res.data?.products || []);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load products";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImagePreview(uri);
        uploadImageToCloudinary(uri);
      }
    } catch (pickerError) {
      console.error("Image picker error:", pickerError);
      Alert.alert("Error", "Failed to pick an image.");
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    setLoading(true);
    try {
      const formData = new FormData();
      // React Native FormData structure - no manual Content-Type header needed
      formData.append("file", {
        uri: imageUri,
        name: "upload.jpg",
        type: "image/jpeg",
      });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          // Don't set Content-Type manually - let React Native set it with boundary
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary upload failed:", response.status, errorText);
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.secure_url) {
        handleChange("imageUrl", data.secure_url);
        setActionMessage("Image uploaded successfully!");
      } else {
        console.error("No secure_url in response:", data);
        setActionMessage(
          data.error?.message || "Failed to upload image to Cloudinary."
        );
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      const errorMsg =
        uploadError?.message || "Cloudinary upload error. Please try again.";
      setActionMessage(`Error: ${errorMsg}`);
      Alert.alert("Upload Error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setIsFormVisible(false);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.quantity) {
      setActionMessage("Please fill required fields");
      return;
    }
    try {
      setActionMessage("");
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        quantity: Number(form.quantity),
        category: form.category,
        images: form.imageUrl ? [form.imageUrl] : [],
      };
      if (editingProduct) {
        await apiClient.put(`/api/products/update/${editingProduct}`, payload, {
          withCredentials: true,
        });
        setActionMessage("Product updated successfully!");
      } else {
        await apiClient.post("/api/products/add", payload, {
          withCredentials: true,
        });
        setActionMessage("Product added successfully!");
      }
      await fetchProducts();
      resetForm();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to save product";
      setActionMessage(msg);
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: String(product.price || ""),
      unit: product.unit || "kg",
      quantity: String(product.quantity || ""),
      category: product.category || "",
      imageUrl: product.images?.[0] || "",
    });
    setImagePreview(product.images?.[0] || null);
    setIsFormVisible(true);
  };

  const deleteProduct = async (productId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this product listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionMessage("");
              await apiClient.delete(`/api/products/delete/${productId}`, {
                withCredentials: true,
              });
              setActionMessage("Product deleted successfully!");
              fetchProducts();
            } catch (err) {
              const msg =
                err?.response?.data?.message ||
                err.message ||
                "Failed to delete product";
              setActionMessage(msg);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>My Products ({products.length})</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (isFormVisible && !editingProduct) {
              resetForm();
            } else {
              setIsFormVisible(true);
              setEditingProduct(null);
              setForm(emptyForm);
              setImagePreview(null);
            }
          }}
        >
          <Feather
            name={isFormVisible && !editingProduct ? "x" : "plus"}
            size={18}
            color={COLORS.surface}
          />
          <Text style={styles.addButtonText}>
            {isFormVisible && !editingProduct ? "Close" : "Add Product"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search by name, description, category..."
        placeholderTextColor={COLORS.muted}
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />

      {actionMessage ? (
        <Text
          style={[
            styles.actionMessage,
            actionMessage.includes("Error") || actionMessage.includes("Failed")
              ? { color: COLORS.danger }
              : { color: COLORS.success },
          ]}
        >
          {actionMessage}
        </Text>
      ) : null}

      {isFormVisible && (
        <ScrollView style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingProduct ? "Edit Product Details" : "Add New Product"}
          </Text>

          {/* Form Fields */}

          <View style={styles.formRow}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Organic Tomatoes"
              placeholderTextColor={COLORS.muted}
              value={form.name}
              onChangeText={(t) => handleChange("name", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRowContainer}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    form.category === cat && styles.chipActive,
                  ]}
                  onPress={() => handleChange("category", cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.category === cat && styles.chipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Price (Rs.) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 500"
              placeholderTextColor={COLORS.muted}
              value={form.price}
              onChangeText={(t) => handleChange("price", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Unit</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRowContainer}
            >
              {UNIT_OPTIONS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.chip, form.unit === unit && styles.chipActive]}
                  onPress={() => handleChange("unit", unit)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.unit === unit && styles.chipTextActive,
                    ]}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="e.g., 100"
              placeholderTextColor={COLORS.muted}
              value={form.quantity}
              onChangeText={(t) => handleChange("quantity", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              multiline
              numberOfLines={4}
              placeholder="Provide a detailed description..."
              placeholderTextColor={COLORS.muted}
              value={form.description}
              onChangeText={(t) => handleChange("description", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity
              style={styles.imagePickerButton}
              onPress={handleImagePick}
              disabled={loading}
            >
              <Text style={styles.imagePickerButtonText}>
                {form.imageUrl || imagePreview
                  ? "Change Image"
                  : "Select Image"}
              </Text>
              <Feather name="upload-cloud" size={16} color={COLORS.surface} />
            </TouchableOpacity>
            {(imagePreview || form.imageUrl) && (
              <Image
                source={{ uri: imagePreview || form.imageUrl }}
                style={styles.imagePreview}
              />
            )}
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.saveText}>
                {editingProduct ? "Update Listing" : "Save Product"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.images?.[0] && (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.cardImage}
              />
            )}
            <View style={styles.productDetails}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{item.name}</Text>
                {item.category ? (
                  <Text style={styles.productCategory}>{item.category}</Text>
                ) : null}
              </View>
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.price}>
                  Rs. {Number(item.price || 0).toLocaleString()} / {item.unit}
                </Text>
                <Text style={styles.quantity}>Qty: {item.quantity}</Text>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.editButton, { flexDirection: "row", gap: 6 }]}
                  onPress={() => startEdit(item)}
                >
                  <Feather name="edit" size={14} color={COLORS.primary} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.deleteButton,
                    { flexDirection: "row", gap: 6 },
                  ]}
                  onPress={() => deleteProduct(item._id)}
                >
                  <Feather name="trash-2" size={14} color={COLORS.danger} />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>
              Use the "Add Product" button to create your first listing.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // --- General Container ---
  container: {
    flex: 1,
    // IMPROVEMENT: Soft, branded background color
    backgroundColor: "#F0FFF0",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // --- Header and Search ---
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    ...SHADOWS.soft,
  },
  addButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    color: COLORS.mutedDark,
  },
  actionMessage: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  // --- Form Card ---
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 20,
    ...SHADOWS.card,
    maxHeight: 450, // Constrain form height
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 15,
  },
  formRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.mutedDark,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#F9F9F9", // Slight contrast background
    color: COLORS.mutedDark,
  },
  // --- Chips (Category/Unit) FIX ---
  chipRowContainer: {
    paddingVertical: 4, // Add padding around chips
  },
  chip: {
    // FIX: Optimized padding for tighter, visually balanced chips
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.border, // Inactive background
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary, // Active background
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  chipTextActive: {
    color: COLORS.surface, // Active text color
    fontWeight: "700",
  },
  // --- Image Picker ---
  imagePickerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
  },
  imagePickerButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  imagePreview: {
    width: "100%",
    height: 120,
    borderRadius: RADIUS.md,
    marginTop: 12,
  },
  // --- Form Buttons ---
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  cancelText: {
    color: COLORS.mutedDark,
    fontWeight: "700",
    fontSize: 15,
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  saveText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 15,
  },
  // --- Product List Card ---
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    ...SHADOWS.soft,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 12,
    borderLeftWidth: 5,
    borderColor: COLORS.accent,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.sm,
    resizeMode: "cover",
  },
  productDetails: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
    flex: 1,
    marginRight: 8,
  },
  productCategory: {
    fontSize: 11,
    backgroundColor: COLORS.accent,
    color: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    fontWeight: "600",
  },
  productDescription: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },
  quantity: {
    fontSize: 13,
    color: COLORS.mutedDark,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.danger,
    opacity: 0.5, // Soft background for danger action
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  deleteText: {
    color: COLORS.danger,
    fontWeight: "800",
    fontSize: 13,
  },
  // --- Utility Styles ---
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F0FFF0",
  },
  loadingText: {
    marginTop: 8,
    color: COLORS.mutedDark,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.danger,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    textAlign: "center",
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: COLORS.surface,
    fontWeight: "600",
  },
});
