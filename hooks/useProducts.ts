import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { ProductService } from '@/services/productService';

// Query keys for better cache management
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  featured: (limit?: number) => [...productKeys.all, 'featured', limit] as const,
  new: (limit?: number) => [...productKeys.all, 'new', limit] as const,
  category: (categoryId: string) => [...productKeys.all, 'category', categoryId] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: ProductService.getAllProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useFeaturedProducts(limit: number = 6) {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => ProductService.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes for featured products
  });
}

export function useNewProducts(limit: number = 6) {
  return useQuery({
    queryKey: productKeys.new(limit),
    queryFn: () => ProductService.getNewProducts(limit),
    staleTime: 1000 * 60 * 10, // 10 minutes for new products
  });
}

export function useProductsByCategory(categoryId: string) {
  return useQuery({
    queryKey: productKeys.category(categoryId),
    queryFn: () => ProductService.getProductsByCategory(categoryId),
    enabled: !!categoryId, // Only run if categoryId is provided
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id, // Only run if id is provided
    staleTime: 1000 * 60 * 15, // 15 minutes for individual products
  });
}

export function useProductSearch(query: string) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => ProductService.searchProducts(query),
    enabled: !!query.trim(), // Only search if query is not empty
    staleTime: 1000 * 60 * 2, // 2 minutes for search results
  });
}

// Infinite query for paginated products
export function useInfiniteProducts(filters: {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  inStockOnly?: boolean;
  sortBy?: 'name' | 'price' | 'rating' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
} = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam = 0 }) =>
      ProductService.getProductsWithFilters({
        ...filters,
        offset: pageParam,
        limit: filters.limit || 10,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the limit, we've reached the end
      if (lastPage.length < (filters.limit || 10)) {
        return undefined;
      }
      return allPages.length * (filters.limit || 10);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for product brands
export function useProductBrands() {
  return useQuery({
    queryKey: [...productKeys.all, 'brands'],
    queryFn: ProductService.getBrands,
    staleTime: 1000 * 60 * 30, // 30 minutes for brands (rarely change)
  });
}

// Hook for product count by category
export function useProductCountByCategory() {
  return useQuery({
    queryKey: [...productKeys.all, 'counts', 'category'],
    queryFn: ProductService.getProductCountByCategory,
    staleTime: 1000 * 60 * 15, // 15 minutes for counts
  });
}