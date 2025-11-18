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
  Alert
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";

const CLOUDINARY_UPLOAD_PRESET = "FarmConnect";
const CLOUDINARY_CLOUD_NAME = "dn5edjpzg";

// Mobile counterpart of ProductManagement.jsx
// Endpoints used:
//  GET  /api/products/my_product
//  POST /api/products/add
//  PUT  /api/products/update/:id
//  DELETE /api/products/delete/:id

const CATEGORY_OPTIONS = [
  "Fruits",
  "Vegetables",
  "Crops",
  "Pesticides",
  "Fertilizer",
  "Other"
];

const UNIT_OPTIONS = ["kg", "g", "lb", "maund", "piece"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  unit: "kg",
  quantity: "",
  category: "",
  imageUrl: ""
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
      const res = await apiClient.get(
        "/api/products/my_product",
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
      formData.append("file", { uri: imageUri, name: "upload.jpg", type: "image/jpeg" });
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        handleChange("imageUrl", data.secure_url);
        setActionMessage("Image uploaded successfully!");
      } else {
        setActionMessage("Failed to upload image to Cloudinary.");
      }
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      setActionMessage("Cloudinary upload error. Please try again.");
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
        images: form.imageUrl ? [form.imageUrl] : []
      };
      if (editingProduct) {
        await apiClient.put(
          `/api/products/update/${editingProduct}`,
          payload,
          { withCredentials: true }
        );
        setActionMessage("Product updated");
      } else {
        await apiClient.post(
          "/api/products/add",
          payload,
          { withCredentials: true }
        );
        setActionMessage("Product added");
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
      imageUrl: product.images?.[0] || ""
    });
    setImagePreview(product.images?.[0] || null);
    setIsFormVisible(true);
  };

  const deleteProduct = async (productId) => {
    try {
      setActionMessage("");
      await apiClient.delete(
        `/api/products/delete/${productId}`,
        { withCredentials: true }
      );
      setActionMessage("Product deleted");
      fetchProducts();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Failed to delete product";
      setActionMessage(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16a34a" />
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
        <Text style={styles.heading}>My Products</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (isFormVisible && !editingProduct) {
              resetForm();
            } else {
              setIsFormVisible(true);
              setEditingProduct(null);
              setForm(emptyForm);
            }
          }}
        >
          <Text style={styles.addButtonText}>
            {isFormVisible && !editingProduct ? "Close Form" : "Add Product"}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search by name, description, category..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.searchInput}
      />

      {actionMessage ? (
        <Text style={styles.actionMessage}>{actionMessage}</Text>
      ) : null}

      {isFormVisible && (
        <ScrollView style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingProduct ? "Edit Product" : "Add New Product"}
          </Text>

          <View style={styles.formRow}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => handleChange("name", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORY_OPTIONS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    form.category === cat && styles.chipActive
                  ]}
                  onPress={() => handleChange("category", cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.category === cat && styles.chipTextActive
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
              value={form.price}
              onChangeText={(t) => handleChange("price", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Unit</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {UNIT_OPTIONS.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.chip,
                    form.unit === unit && styles.chipActive
                  ]}
                  onPress={() => handleChange("unit", unit)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      form.unit === unit && styles.chipTextActive
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
              value={form.description}
              onChangeText={(t) => handleChange("description", t)}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Product Image</Text>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handleImagePick} disabled={loading}>
              <Text style={styles.imagePickerButtonText}>Pick an image</Text>
            </TouchableOpacity>
            {imagePreview && (
              <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            )}
            {form.imageUrl && !imagePreview && ( // Display existing image if no new one picked
              <Image source={{ uri: form.imageUrl }} style={styles.imagePreview} />
            )}
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
              <Text style={styles.saveText}>
                {editingProduct ? "Update" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
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
                style={styles.editButton}
                onPress={() => startEdit(item)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteProduct(item._id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>
              Use “Add Product” to create your first listing.
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space_between",
    alignItems: "center",
    marginBottom: 12
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primaryDark
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10
  },
  actionMessage: {
    color: "#16a34a",
    fontSize: 12,
    marginBottom: 8
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 16,
    ...SHADOWS.card
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10
  },
  formRow: {
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
    fontWeight: "500"
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: COLORS.surface
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: "#e5e7eb",
    marginRight: 8
  },
  chipActive: {
    backgroundColor: "#166534"
  },
  chipText: {
    fontSize: 12,
    color: "#374151"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 10
  },
  cancelText: {
    color: "#374151",
    fontWeight: "600"
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#166534"
  },
  saveText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 12,
    ...SHADOWS.card
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 6
  },
  productCategory: {
    fontSize: 11,
    backgroundColor: "#dcfce7",
    color: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999
  },
  productDescription: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16a34a"
  },
  quantity: {
    fontSize: 12,
    color: "#4b5563"
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12
  },
  editButton: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  editText: {
    color: COLORS.primary,
    fontWeight: "600"
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: "#fee2e2"
  },
  deleteText: {
    color: "#b91c1c",
    fontWeight: "600"
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
    marginBottom: 12
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
  },
  imagePickerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12
  },
  imagePickerButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 13
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: RADIUS.md,
    marginTop: 8,
    marginBottom: 12
  }
});


