/*
  # Simplified Orders Table

  1. New Tables
    - `orders`
      - Complete order information with customer details
      - Status tracking and timestamps
      - Payment and shipping information
      - All order items stored as JSONB array

  2. Security
    - Enable RLS on orders table
    - Add policies for authenticated users

  3. Indexes
    - Optimize for common queries
    - Support efficient filtering and sorting
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Create simplified orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Customer information
  customer_name text,
  customer_email text,
  customer_phone text,
  
  -- Order items (stored as JSONB array)
  items jsonb NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal bigint NOT NULL DEFAULT 0,
  tax bigint NOT NULL DEFAULT 0,
  shipping_cost bigint NOT NULL DEFAULT 0,
  discount_amount bigint NOT NULL DEFAULT 0,
  total bigint NOT NULL DEFAULT 0,
  
  -- Shipping address (stored as JSONB for flexibility)
  shipping_address jsonb NOT NULL,
  
  -- Payment method (stored as JSONB)
  payment_method jsonb NOT NULL,
  
  -- Shipping method (stored as JSONB)
  shipping_method jsonb NOT NULL,
  
  -- Additional fields
  discount_code text,
  tracking_number text,
  estimated_delivery timestamptz,
  notes text,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true); -- For now, allow all authenticated users to see orders (admin functionality)

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete orders"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  prefix text := 'AG';
  timestamp_part text;
  random_part text;
  order_number text;
BEGIN
  -- Get timestamp part (last 6 digits of unix timestamp)
  timestamp_part := RIGHT(EXTRACT(epoch FROM now())::text, 6);
  
  -- Generate random 3-character string
  random_part := UPPER(substring(md5(random()::text) from 1 for 3));
  
  -- Combine parts
  order_number := prefix || timestamp_part || random_part;
  
  RETURN order_number;
END;
$$ language 'plpgsql';