/*
  # Create products table for AgriLink

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `category` (text, product category)
      - `category_id` (text, category identifier)
      - `price_amount` (bigint, price in TZS)
      - `price_currency` (text, currency code)
      - `weight` (text, product weight)
      - `volume` (text, product volume)
      - `length` (text, product length)
      - `capacity` (text, product capacity)
      - `sku` (text, unique product identifier)
      - `brand` (text, brand name)
      - `img` (text, image URL)
      - `key_features` (text[], array of key features)
      - `description` (text, product description)
      - `usage_instructions` (text[], array of usage instructions)
      - `benefits` (text[], array of benefits)
      - `specifications` (jsonb, product specifications)
      - `stock_status` (text, stock status)
      - `quantity_in_stock` (integer, available quantity)
      - `discount` (integer, discount percentage)
      - `availability` (text[], array of available regions)
      - `tags` (text[], array of tags)
      - `rating` (decimal, product rating)
      - `reviews_count` (integer, number of reviews)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for authenticated users to manage products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  category_id text NOT NULL,
  price_amount bigint NOT NULL,
  price_currency text NOT NULL DEFAULT 'TSh',
  weight text,
  volume text,
  length text,
  capacity text,
  sku text UNIQUE NOT NULL,
  brand text NOT NULL,
  img text NOT NULL,
  key_features text[] DEFAULT '{}',
  description text NOT NULL,
  usage_instructions text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  stock_status text NOT NULL DEFAULT 'In Stock',
  quantity_in_stock integer NOT NULL DEFAULT 0,
  discount integer DEFAULT 0,
  availability text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating decimal(3,2) DEFAULT 0.0,
  reviews_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update/delete products
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();