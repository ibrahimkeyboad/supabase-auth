import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingCart, Heart } from 'lucide-react-native';

import Colors from '@/constants/Colors';
import Typography from '@/constants/Typography';
import Card from './Card';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/utils/currency';
import { Product } from '@/types/ecommerce';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  supplier?: string;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  onAddToCart?: () => void;
  variant?: 'horizontal' | 'vertical' | 'compact';
  product?: Product;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2 - 24;

export default function ProductCard({
  id,
  name,
  imageUrl,
  price,
  originalPrice,
  rating,
  supplier,
  isFavorite = false,
  onFavoritePress,
  onAddToCart,
  variant = 'vertical',
  product,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart, isItemInCart } = useCart();

  const handlePress = () => {
    router.push(`/products/${id}`);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
    }
    onAddToCart?.();
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'horizontal':
        return styles.horizontalCard;
      case 'compact':
        return styles.compactCard;
      default:
        return styles.verticalCard;
    }
  };

  const renderContent = () => {
    if (variant === 'horizontal') {
      return (
        <View style={styles.horizontalContent}>
          <Image source={{ uri: imageUrl }} style={styles.horizontalImage} />
          <View style={styles.horizontalDetails}>
            <View>
              {supplier && <Text style={styles.supplier}>{supplier}</Text>}
              <Text style={styles.name} numberOfLines={2}>{name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{formatCurrency(price)}</Text>
                {originalPrice && originalPrice > price && (
                  <Text style={styles.originalPrice}>{formatCurrency(originalPrice)}</Text>
                )}
              </View>
            </View>
            <View style={styles.horizontalActions}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleAddToCart}
              >
                <ShoppingCart size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    if (variant === 'compact') {
      return (
        <View style={styles.compactContent}>
          <Image source={{ uri: imageUrl }} style={styles.compactImage} />
          <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
        </View>
      );
    }

    return (
      <View style={styles.verticalContent}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={onFavoritePress}
        >
          <Heart
            size={20}
            color={isFavorite ? Colors.error[500] : Colors.neutral[500]}
            fill={isFavorite ? Colors.error[500] : 'none'}
          />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl }} style={styles.verticalImage} />
        {supplier && <Text style={styles.supplier}>{supplier}</Text>}
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(price)}</Text>
          {originalPrice && originalPrice > price && (
            <Text style={styles.originalPrice}>{formatCurrency(originalPrice)}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.cartButton,
            isItemInCart(id) && styles.cartButtonAdded
          ]}
          onPress={handleAddToCart}
        >
          <ShoppingCart size={16} color={Colors.white} />
          <Text style={styles.cartButtonText}>
            {isItemInCart(id) ? 'Added' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Card style={[styles.card, getCardStyle()]}>
        {renderContent()}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  verticalCard: {
    width: CARD_WIDTH,
    height: 280,
  },
  horizontalCard: {
    width: '100%',
    height: 120,
  },
  compactCard: {
    width: 120,
    height: 180,
  },
  verticalContent: {
    padding: 12,
  },
  horizontalContent: {
    flexDirection: 'row',
    height: '100%',
  },
  compactContent: {
    padding: 8,
  },
  verticalImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  horizontalImage: {
    width: 100,
    height: '100%',
  },
  compactImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 4,
  },
  horizontalDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  horizontalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  name: {
    ...Typography.body,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  compactName: {
    ...Typography.bodySmall,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  supplier: {
    ...Typography.caption,
    color: Colors.primary[700],
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  price: {
    ...Typography.price,
    fontSize: 16,
  },
  originalPrice: {
    ...Typography.discount,
    marginLeft: 8,
    fontSize: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary[700],
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  cartButtonAdded: {
    backgroundColor: Colors.success[600],
  },
  cartButtonText: {
    ...Typography.button,
    fontSize: 12,
    marginLeft: 4,
  },
});