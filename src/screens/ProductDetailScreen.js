import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { apiClient } from "../api/client";
import { COLORS, SHADOWS, RADIUS } from "../styles/theme";
import { Ionicons } from "@expo/vector-icons";

// Star Rating Component
const StarRating = ({ rating, interactive = false, onRate = null, size = 20 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.floor(rating);
    const half = i === Math.ceil(rating) && rating % 1 !== 0;
    
    stars.push(
      <TouchableOpacity
        key={i}
        onPress={() => interactive && onRate && onRate(i)}
        disabled={!interactive}
      >
        <Ionicons
          name={filled ? "star" : half ? "star-half" : "star-outline"}
          size={size}
          color={filled || half ? "#FFA500" : "#D1D5DB"}
        />
      </TouchableOpacity>
    );
  }
  return <View style={styles.starContainer}>{stars}</View>;
};

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params || {};
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [supplier, setSupplier] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [sentimentStats, setSentimentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    } else {
      setError("No product ID provided");
      setLoading(false);
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get(`/api/products/${productId}/details`, {
        withCredentials: true,
      });
      
      if (res.data.success && res.data.product) {
        setProduct(res.data.product);
        setSupplier(res.data.supplier || null);
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setSentimentStats(res.data.sentimentStats || null);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load product";
      setError(msg);
      console.error("Product fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product?.isAvailable) {
      Alert.alert("Unavailable", "This product is currently out of stock.");
      return;
    }
    try {
      await apiClient.post(
        "/api/cart/add",
        { productId: product._id, quantity: 1 },
        { withCredentials: true }
      );
      Alert.alert("Success", "Product added to cart!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add to cart";
      Alert.alert("Error", msg);
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await apiClient.post(
        "/api/wishlist/add",
        { productId: product._id },
        { withCredentials: true }
      );
      Alert.alert("Success", "Product added to wishlist!");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add to wishlist";
      Alert.alert("Error", msg);
    }
  };

  const openReviewModal = () => {
    setReviewForm({ rating: 0, comment: "" });
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setReviewForm({ rating: 0, comment: "" });
  };

  const submitReview = async () => {
    if (reviewForm.rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }
    if (!reviewForm.comment.trim()) {
      Alert.alert("Error", "Please write a comment");
      return;
    }

    try {
      setSubmittingReview(true);
      await apiClient.post(
        "/api/review/add",
        {
          productId: product._id,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        },
        { withCredentials: true }
      );
      Alert.alert("Success", "Review submitted successfully!");
      closeReviewModal();
      fetchProductDetails();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit review";
      Alert.alert("Error", msg);
    } finally {
      setSubmittingReview(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Product not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          {product.images && product.images.length > 0 ? (
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={50} color={COLORS.muted} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          
          {/* Rating Display */}
          <View style={styles.ratingRow}>
            <StarRating rating={averageRating} size={18} />
            <Text style={styles.ratingText}>
              {averageRating > 0 ? `${averageRating.toFixed(1)}/5.0` : "No ratings"} ({reviews.length} reviews)
            </Text>
          </View>

          {/* Sentiment Stats */}
          {sentimentStats && (
            <View style={styles.sentimentContainer}>
              <View style={styles.sentimentItem}>
                <Text style={[styles.sentimentBadge, { backgroundColor: COLORS.success }]}>
                  👍 {sentimentStats.positive || 0}
                </Text>
              </View>
              <View style={styles.sentimentItem}>
                <Text style={[styles.sentimentBadge, { backgroundColor: COLORS.muted }]}>
                  😐 {sentimentStats.neutral || 0}
                </Text>
              </View>
              <View style={styles.sentimentItem}>
                <Text style={[styles.sentimentBadge, { backgroundColor: COLORS.danger }]}>
                  👎 {sentimentStats.negative || 0}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs. {product.price.toLocaleString()}</Text>
            <Text style={styles.unit}>per {product.unit}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{product.category}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Available Quantity:</Text>
            <Text style={styles.value}>
              {product.quantity} {product.unit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text
              style={[
                styles.value,
                { color: product.isAvailable ? COLORS.success : COLORS.danger },
              ]}
            >
              {product.isAvailable ? "In Stock" : "Out of Stock"}
            </Text>
          </View>

          {supplier && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Supplier:</Text>
              <Text style={styles.value}>{supplier.name}</Text>
            </View>
          )}
          {supplier && supplier.email && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Supplier Email:</Text>
              <Text style={styles.value}>{supplier.email}</Text>
            </View>
          )}
          {supplier && supplier.phone && (
            <View style={styles.detailRow}>
              <Text style={styles.label}>Supplier Phone:</Text>
              <Text style={styles.value}>{supplier.phone}</Text>
            </View>
          )}

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                !product.isAvailable && styles.disabledButton,
              ]}
              onPress={handleAddToCart}
              disabled={!product.isAvailable}
            >
              <Ionicons name="cart" size={20} color={COLORS.surface} />
              <Text style={styles.buttonText}>
                {product.isAvailable ? "Add to Cart" : "Out of Stock"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wishlistButton}
              onPress={handleAddToWishlist}
            >
              <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <TouchableOpacity style={styles.addReviewButton} onPress={openReviewModal}>
                <Ionicons name="add-circle" size={20} color={COLORS.primary} />
                <Text style={styles.addReviewText}>Add Review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>
                      {review.user?.name || review.userId?.name || "Anonymous"}
                    </Text>
                    <StarRating rating={review.rating} size={14} />
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  {review.sentiment && (
                    <View style={styles.sentimentBadgeInline}>
                      <Text style={styles.sentimentText}>
                        {review.sentiment === "positive" ? "👍" : review.sentiment === "negative" ? "👎" : "😐"} {review.sentiment}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={closeReviewModal}>
                <Ionicons name="close" size={24} color={COLORS.mutedDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Rating *</Text>
              <StarRating
                rating={reviewForm.rating}
                interactive={true}
                onRate={(rating) => setReviewForm({ ...reviewForm, rating })}
                size={30}
              />
              {reviewForm.rating > 0 && (
                <Text style={styles.ratingHelperText}>
                  {reviewForm.rating} star{reviewForm.rating !== 1 ? "s" : ""} selected
                </Text>
              )}

              <Text style={[styles.modalLabel, { marginTop: 20 }]}>Review Comment *</Text>
              <TextInput
                style={styles.commentInput}
                value={reviewForm.comment}
                onChangeText={(text) => setReviewForm({ ...reviewForm, comment: text })}
                placeholder="Share your experience with this product..."
                placeholderTextColor={COLORS.muted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeReviewModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    submittingReview && styles.disabledButton,
                  ]}
                  onPress={submitReview}
                  disabled={submittingReview}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF0",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F0FFF0",
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
    marginBottom: 20,
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
    fontSize: 15,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    backgroundColor: COLORS.background,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.border,
  },
  infoSection: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  starContainer: {
    flexDirection: "row",
    gap: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
  },
  unit: {
    fontSize: 16,
    color: COLORS.muted,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  descriptionSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: RADIUS.pill,
    ...SHADOWS.soft,
  },
  wishlistButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: RADIUS.pill,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  disabledButton: {
    backgroundColor: COLORS.muted,
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
  reviewsSection: {
    marginTop: 20,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  addReviewText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  reviewCard: {
    backgroundColor: COLORS.background,
    padding: 15,
    borderRadius: RADIUS.md,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.mutedDark,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.muted,
  },
  noReviews: {
    textAlign: "center",
    color: COLORS.muted,
    fontStyle: "italic",
    paddingVertical: 20,
  },
  sentimentContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  sentimentItem: {
    flex: 1,
  },
  sentimentBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.pill,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.surface,
    textAlign: "center",
  },
  sentimentBadgeInline: {
    alignSelf: "flex-start",
    marginTop: 5,
    marginBottom: 5,
  },
  sentimentText: {
    fontSize: 12,
    color: COLORS.mutedDark,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.mutedDark,
    marginBottom: 10,
  },
  ratingHelperText: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: 14,
    color: COLORS.mutedDark,
    backgroundColor: COLORS.background,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.mutedDark,
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    ...SHADOWS.soft,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: "700",
  },
});
