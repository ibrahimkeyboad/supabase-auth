import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronRight,
} from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useProduct } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/currency';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  
  // Use React Query hook instead of useEffect
  const { data: product, isLoading, error, refetch } = useProduct(id || '');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[700]} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Product not found</Text>
        <Text style={styles.errorText}>
          {error?.message || 'The product you are looking for does not exist.'}
        </Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <Button
          title="Retry"
          onPress={refetch}
          variant="outline"
          style={styles.retryButton}
        />
      </View>
    );
  }

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

 

  const renderImagePaginator = () => {
    // For now, we'll just show one image, but this can be extended for multiple images
    return (
      <View style={styles.paginatorContainer}>
        <View style={[styles.paginatorDot, styles.paginatorDotActive]} />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.neutral[800]} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleFavorite}
            >
              <Heart
                size={24}
                color={isFavorite ? Colors.error[500] : Colors.neutral[800]}
                fill={isFavorite ? Colors.error[500] : 'none'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Share2 size={24} color={Colors.neutral[800]} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.img }} style={styles.productImage} />
            {renderImagePaginator()}
            {product.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  -{product.discount}% OFF
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.supplier}>{product.brand}</Text>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.category}>{product.category}</Text>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    color={
                      star <= Math.floor(product.rating)
                        ? Colors.warning[500]
                        : Colors.neutral[300]
                    }
                    fill={
                      star <= Math.floor(product.rating)
                        ? Colors.warning[500]
                        : 'none'
                    }
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{formatCurrency(product.price.amount)}</Text>
              <Text style={styles.sku}>SKU: {product.sku}</Text>
            </View>

            {/* Product specifications */}
            {product.weight && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Weight:</Text>
                <Text style={styles.specValue}>{product.weight}</Text>
              </View>
            )}
            {product.volume && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Volume:</Text>
                <Text style={styles.specValue}>{product.volume}</Text>
              </View>
            )}
            {product.capacity && (
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Capacity:</Text>
                <Text style={styles.specValue}>{product.capacity}</Text>
              </View>
            )}

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(1)}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stockInfo}>
              <Text style={[
                styles.stockText, 
                product.stockStatus === 'In Stock' ? styles.inStock : styles.outOfStock
              ]}>
                {product.stockStatus === 'In Stock' 
                  ? `In Stock (${product.quantityInStock} available)` 
                  : 'Out of Stock'
                }
              </Text>
            </View>

            <View style={styles.sectionDivider} />

            <Text style={styles.sectionTitle}>About this product</Text>
            <Text style={styles.description}>{product.description}</Text>

            {/* Key Features */}
            {product.key_features.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Key Features</Text>
                {product.key_features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Benefits */}
            {product.benefits.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Benefits</Text>
                {product.benefits.map((benefit, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureBullet}>•</Text>
                    <Text style={styles.featureText}>{benefit}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Usage Instructions */}
            {product.usage_instructions.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Usage Instructions</Text>
                {product.usage_instructions.map((instruction, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.instructionNumber}>{index + 1}.</Text>
                    <Text style={styles.featureText}>{instruction}</Text>
                  </View>
                ))}
              </>
            )}

            <View style={styles.features}>
              <View style={styles.featureItem}>
                <Truck size={20} color={Colors.primary[700]} />
                <Text style={styles.featureText}>Free delivery for orders above TSh 100,000</Text>
              </View>
              <View style={styles.featureItem}>
                <ShieldCheck size={20} color={Colors.primary[700]} />
                <Text style={styles.featureText}>Genuine product guarantee</Text>
              </View>
              <View style={styles.featureItem}>
                <RefreshCw size={20} color={Colors.primary[700]} />
                <Text style={styles.featureText}>7-day return policy</Text>
              </View>
            </View>

            <View style={styles.bottomPadding} />
          </View>
        </ScrollView>

        {/* Fixed footer with Add to Cart button */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <View style={styles.priceSection}>
              <Text style={styles.footerPriceLabel}>Total</Text>
              <Text style={styles.footerPrice}>
                {formatCurrency(product.price.amount * quantity)}
              </Text>
            </View>
            {/* <Button
              title={isItemInCart(product.id) ? 'Added to Cart' : 'Add to Cart'}
              onPress={handleAddToCart}
              leftIcon={<ShoppingCart size={20} color={Colors.white} />}
              style={[
                styles.addToCartButton,
                isItemInCart(product.id) && styles.addedToCartButton
              ]}
              disabled={product.stockStatus !== 'In Stock'}
            /> */}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.white,
  },
  errorTitle: {
    ...Typography.h4,
    marginBottom: 8,
  },
  errorText: {
    ...Typography.body,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    zIndex: 10,
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
    backgroundColor: Colors.neutral[100],
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  paginatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
    marginHorizontal: 4,
  },
  paginatorDotActive: {
    backgroundColor: Colors.primary[700],
    width: 24,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.error[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontFamily: 'Inter-SemiBold',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  supplier: {
    ...Typography.body,
    color: Colors.primary[700],
    marginBottom: 4,
  },
  productName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  category: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    ...Typography.bodySmall,
    color: Colors.neutral[600],
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    ...Typography.h2,
    color: Colors.primary[700],
  },
  sku: {
    ...Typography.caption,
    color: Colors.neutral[500],
  },
  specRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specLabel: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    width: 80,
  },
  specValue: {
    ...Typography.body,
    color: Colors.neutral[700],
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  quantityLabel: {
    ...Typography.body,
    marginRight: 16,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    ...Typography.h4,
    color: Colors.neutral[700],
  },
  quantityValue: {
    width: 40,
    textAlign: 'center',
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
  },
  stockInfo: {
    marginBottom: 16,
  },
  stockText: {
    ...Typography.bodySmall,
    fontFamily: 'Inter-Medium',
  },
  inStock: {
    color: Colors.success[600],
  },
  outOfStock: {
    color: Colors.error[600],
  },
  sectionDivider: {
    height: 8,
    backgroundColor: Colors.neutral[100],
    marginHorizontal: -16,
    marginVertical: 16,
  },
  sectionTitle: {
    ...Typography.h5,
    marginBottom: 12,
    marginTop: 8,
  },
  description: {
    ...Typography.body,
    color: Colors.neutral[700],
    lineHeight: 22,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureBullet: {
    ...Typography.body,
    color: Colors.primary[700],
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
  },
  instructionNumber: {
    ...Typography.body,
    color: Colors.primary[700],
    marginRight: 8,
    fontFamily: 'Inter-SemiBold',
    minWidth: 20,
  },
  featureText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 20,
  },
  features: {
    marginTop: 16,
    marginBottom: 16,
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  priceSection: {
    flex: 1,
    marginRight: 16,
  },
  footerPriceLabel: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginBottom: 2,
  },
  footerPrice: {
    ...Typography.h4,
    color: Colors.primary[700],
  },
  addToCartButton: {
    flex: 2,
    minWidth: 180,
  },
  addedToCartButton: {
    backgroundColor: Colors.success[600],
  },
});