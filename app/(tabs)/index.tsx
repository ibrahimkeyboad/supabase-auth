import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import ProductCard from '@/components/common/ProductCard';
import { categories } from '@/data/categories';
import { useFeaturedProducts, useNewProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/currency';
import UserProfile from '@/components/auth/UserProfile';
import AuthGuard from '@/components/auth/AuthGuard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Use React Query hooks instead of useEffect
  const {
    data: featuredProducts = [],
    isLoading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts(6);

  const {
    data: newProducts = [],
    isLoading: newLoading,
    error: newError,
    refetch: refetchNew,
  } = useNewProducts(6);

  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...categories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];

  const onRefresh = async () => {
    try {
      await Promise.all([refetchFeatured(), refetchNew()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const renderCategoryTab = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.activeCategoryTab,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === item.id && styles.activeCategoryTabText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <View style={styles.productImageContainer}>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}%</Text>
          </View>
        )}
        <Image source={{ uri: item.img }} style={styles.productImage} />
      </View>

      <View style={styles.productInfo}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            {formatCurrency(item.price.amount)}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>★ {item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviewsCount})</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary[700]} />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );

  const renderErrorState = (error: string) => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Error: {error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredProducts =
    selectedCategory === 'all'
      ? [...featuredProducts, ...newProducts]
      : [...featuredProducts, ...newProducts].filter(
          (p) => p.categoryId === selectedCategory
        );

  const isRefreshing = featuredLoading || newLoading;

  return (
    <AuthGuard>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <UserProfile showSignOut={false} style={styles.userProfile} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary[700]]}
              tintColor={Colors.primary[700]}
            />
          }
        >
          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            <FlatList
              data={categoryTabs}
              renderItem={renderCategoryTab}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          </View>

          {/* Featured Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity
                onPress={() => router.push('/products/featured')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {featuredLoading ? (
              renderLoadingState()
            ) : featuredError ? (
              renderErrorState(featuredError.message)
            ) : (
              <FlatList
                data={featuredProducts.slice(0, 4)}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productGrid}
              />
            )}
          </View>

          {/* New Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <TouchableOpacity onPress={() => router.push('/products/new')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {newLoading ? (
              renderLoadingState()
            ) : newError ? (
              renderErrorState(newError.message)
            ) : (
              <FlatList
                data={newProducts.slice(0, 4)}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productGrid}
              />
            )}
          </View>

          {/* All Products Section */}
          {!featuredLoading && !newLoading && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory === 'all'
                    ? 'All Products'
                    : `${
                        categoryTabs.find((c) => c.id === selectedCategory)
                          ?.name
                      } Products`}
                </Text>
              </View>

              <FlatList
                data={filteredProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.productGrid}
              />
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  userProfile: {
    flex: 1,
    marginRight: 16,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    position: 'relative',
    padding: 12,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: Colors.neutral[50],
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.primary[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  categoryContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  categoryList: {
    paddingHorizontal: 16,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.neutral[100],
  },
  activeCategoryTab: {
    backgroundColor: Colors.neutral[900],
  },
  categoryTabText: {
    ...Typography.body,
    color: Colors.neutral[600],
    fontFamily: 'Inter-Medium',
  },
  activeCategoryTabText: {
    color: Colors.white,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.neutral[900],
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary[700],
    fontFamily: 'Inter-Medium',
  },
  productGrid: {
    gap: 16,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.error[500],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  productInfo: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary[50],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  categoryBadgeText: {
    color: Colors.primary[700],
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  productName: {
    ...Typography.body,
    fontFamily: 'Inter-SemiBold',
    color: Colors.neutral[900],
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    ...Typography.caption,
    color: Colors.neutral[600],
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary[600],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.warning[500],
    fontFamily: 'Inter-Medium',
    marginRight: 4,
  },
  reviewsText: {
    fontSize: 10,
    color: Colors.neutral[500],
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.neutral[600],
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error[600],
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary[700],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.button,
    fontSize: 14,
  },
  bottomPadding: {
    height: 100,
  },
});
