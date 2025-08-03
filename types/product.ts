export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: {
    amount: number;
    currency: string;
  };
  weight?: string;
  volume?: string;
  length?: string;
  capacity?: string;
  sku: string;
  brand: string;
  img: string;
  key_features: string[];
  description: string;
  usage_instructions: string[];
  benefits: string[];
  specifications: {
    type?: string;
    days_to_maturity?: string;
    origin?: string;
    form?: string;
    nutrient_content?: string;
    packaging?: string;
    application_rate?: string;
    pack_sizes?: string[];
    composition?: string;
    active_ingredient?: string;
    variety?: string;
    maturity?: string;
    material?: string;
    diameter?: string;
    [key: string]: any;
  };
  stockStatus: string;
  quantityInStock: number;
  discount: number;
  availability: string[];
  tags: string[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
}

// Database types (matching Supabase schema)
export interface ProductDB {
  id: string;
  name: string;
  category: string;
  category_id: string;
  price_amount: number;
  price_currency: string;
  weight?: string;
  volume?: string;
  length?: string;
  capacity?: string;
  sku: string;
  brand: string;
  img: string;
  key_features: string[];
  description: string;
  usage_instructions: string[];
  benefits: string[];
  specifications: any;
  stock_status: string;
  quantity_in_stock: number;
  discount: number;
  availability: string[];
  tags: string[];
  rating: number;
  reviews_count: number;
  created_at: string;
  updated_at: string;
}