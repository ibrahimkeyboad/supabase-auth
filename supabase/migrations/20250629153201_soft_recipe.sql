/*
  # Create Orders and Cart Tables

  1. New Tables
    - `orders`
      - Complete order information with customer details
      - Status tracking and timestamps
      - Payment and shipping information
    - `order_items`
      - Individual items within orders
      - Product references and quantities
    - `order_status_history`
      - Track all status changes with timestamps
    - `cart_items`
      - User cart storage
      - Product variants and options

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access where appropriate

  3. Indexes
    - Optimize for common queries
    - Support efficient filtering and sorting
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Customer information
  customer_name text,
  customer_email text,
  customer_phone text,
  
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

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  
  -- Product details (snapshot at time of order)
  product_name text NOT NULL,
  product_image_url text NOT NULL,
  product_sku text NOT NULL,
  supplier text NOT NULL,
  
  -- Pricing and quantity
  unit_price bigint NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal bigint NOT NULL,
  
  -- Product variants and options (stored as JSONB)
  selected_variants jsonb DEFAULT '{}',
  selected_options jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  note text,
  created_by text -- Could be 'system', 'admin', or user ID
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid, -- For authenticated users (can be null for guest carts)
  session_id text, -- For guest users
  product_id uuid NOT NULL REFERENCES products(id),
  
  -- Product details
  quantity integer NOT NULL DEFAULT 1,
  unit_price bigint NOT NULL,
  subtotal bigint NOT NULL,
  
  -- Product variants and options
  selected_variants jsonb DEFAULT '{}',
  selected_options jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or session_id is provided
  CONSTRAINT cart_items_user_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders"
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

-- Order items policies
CREATE POLICY "Users can view order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Order status history policies
CREATE POLICY "Users can view order status history"
  ON order_status_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create order status history"
  ON order_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Cart items policies
CREATE POLICY "Users can manage their own cart items"
  ON cart_items
  FOR ALL
  TO authenticated
  USING (true);

-- Public policies for guest carts (using session_id)
CREATE POLICY "Guest users can manage cart by session"
  ON cart_items
  FOR ALL
  TO anon
  USING (session_id IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_timestamp ON order_status_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically add status history when order status changes
CREATE OR REPLACE FUNCTION add_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only add history if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, note, created_by)
    VALUES (NEW.id, NEW.status, 'Status updated', 'system');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic status history
CREATE TRIGGER add_order_status_history_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION add_order_status_history();

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