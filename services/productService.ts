import { supabase } from '@/lib/supabase';
import { Product, ProductDB, Category } from '@/types/product';

// Transform database product to app product format
const transformProduct = (dbProduct: ProductDB): Product => {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category,
    categoryId: dbProduct.category_id,
    price: {
      amount: dbProduct.price_amount,
      currency: dbProduct.price_currency,
    },
    weight: dbProduct.weight,
    volume: dbProduct.volume,
    length: dbProduct.length,
    capacity: dbProduct.capacity,
    sku: dbProduct.sku,
    brand: dbProduct.brand,
    img: dbProduct.img,
    key_features: dbProduct.key_features || [],
    description: dbProduct.description,
    usage_instructions: dbProduct.usage_instructions || [],
    benefits: dbProduct.benefits || [],
    specifications: dbProduct.specifications || {},
    stockStatus: dbProduct.stock_status,
    quantityInStock: dbProduct.quantity_in_stock,
    discount: dbProduct.discount,
    availability: dbProduct.availability || [],
    tags: dbProduct.tags || [],
    rating: dbProduct.rating,
    reviewsCount: dbProduct.reviews_count,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
};

export class ProductService {
  // Get all products
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products by category:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching product by ID:', error);
        throw error;
      }

      return data ? transformProduct(data) : null;
    } catch (error) {
      console.error('Failed to fetch product by ID:', error);
      throw error;
    }
  }

  // Search products
  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%, description.ilike.%${query}%, brand.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to search products:', error);
      throw error;
    }
  }

  // Get featured products (highest rated)
  static async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      throw error;
    }
  }

  // Get new products (most recent)
  static async getNewProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching new products:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch new products:', error);
      throw error;
    }
  }

  // Get products with filters
  static async getProductsWithFilters(filters: {
    categoryIds?: string[];
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    inStockOnly?: boolean;
    sortBy?: 'name' | 'price' | 'rating' | 'created_at';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    try {
      let query = supabase.from('products').select('*');

      // Apply filters
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        query = query.in('category_id', filters.categoryIds);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price_amount', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price_amount', filters.maxPrice);
      }

      if (filters.brands && filters.brands.length > 0) {
        query = query.in('brand', filters.brands);
      }

      if (filters.inStockOnly) {
        query = query.eq('stock_status', 'In Stock').gt('quantity_in_stock', 0);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy === 'price' ? 'price_amount' : sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products with filters:', error);
        throw error;
      }

      return data?.map(transformProduct) || [];
    } catch (error) {
      console.error('Failed to fetch products with filters:', error);
      throw error;
    }
  }

  // Get unique brands
  static async getBrands(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('brand')
        .order('brand');

      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }

      // Get unique brands
      const brands = [...new Set(data?.map(item => item.brand) || [])];
      return brands;
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      throw error;
    }
  }

  // Get product count by category
  static async getProductCountByCategory(): Promise<{ [categoryId: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category_id');

      if (error) {
        console.error('Error fetching product counts:', error);
        throw error;
      }

      // Count products by category
      const counts: { [categoryId: string]: number } = {};
      data?.forEach(item => {
        counts[item.category_id] = (counts[item.category_id] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Failed to fetch product counts:', error);
      throw error;
    }
  }
}