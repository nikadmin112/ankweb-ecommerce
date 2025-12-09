-- ================================================
-- ANKWEB E-COMMERCE DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: products
-- ================================================
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    full_description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(5, 2) DEFAULT 0,
    badge TEXT,
    category TEXT,
    image TEXT,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ================================================
-- TABLE: categories
-- ================================================
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: offers
-- ================================================
CREATE TABLE offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: orders
-- ================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    items JSONB NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'order-placed',
    payment_method TEXT NOT NULL,
    payment_nationality TEXT NOT NULL,
    notes TEXT,
    screenshot_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ================================================
-- TABLE: videos
-- ================================================
CREATE TABLE videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active videos
CREATE INDEX idx_videos_active ON videos(is_active, created_at DESC);

-- ================================================
-- TABLE: crypto_coins
-- ================================================
CREATE TABLE crypto_coins (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: crypto_networks
-- ================================================
CREATE TABLE crypto_networks (
    id TEXT PRIMARY KEY,
    coin_id TEXT NOT NULL REFERENCES crypto_coins(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    deposit_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for crypto networks
CREATE INDEX idx_crypto_networks_coin_id ON crypto_networks(coin_id);

-- ================================================
-- TABLE: payment_settings
-- ================================================
CREATE TABLE payment_settings (
    id TEXT PRIMARY KEY,
    method TEXT NOT NULL,
    upi_id TEXT,
    bank_details JSONB,
    email TEXT,
    crypto_address TEXT,
    crypto_network TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TABLE: promo_codes
-- ================================================
CREATE TABLE promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase NUMERIC(10, 2),
    max_discount NUMERIC(10, 2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for promo codes
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_networks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Products: Public read, authenticated write
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Categories: Public read, authenticated write
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Offers: Public read, authenticated write
CREATE POLICY "Anyone can view offers" ON offers
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage offers" ON offers
    FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Users can view their own orders, authenticated users can manage all
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (
        customer_id = current_setting('app.user_id', true) OR
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Videos: Public read active videos, authenticated write
CREATE POLICY "Anyone can view active videos" ON videos
    FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage videos" ON videos
    FOR ALL USING (auth.role() = 'authenticated');

-- Crypto: Public read, authenticated write
CREATE POLICY "Anyone can view crypto coins" ON crypto_coins
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage crypto coins" ON crypto_coins
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view crypto networks" ON crypto_networks
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage crypto networks" ON crypto_networks
    FOR ALL USING (auth.role() = 'authenticated');

-- Payment Settings: Authenticated only
CREATE POLICY "Authenticated users can view payment settings" ON payment_settings
    FOR SELECT USING (auth.role() = 'authenticated' OR true);

CREATE POLICY "Authenticated users can manage payment settings" ON payment_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Promo Codes: Public read active, authenticated write
CREATE POLICY "Anyone can view active promo codes" ON promo_codes
    FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage promo codes" ON promo_codes
    FOR ALL USING (auth.role() = 'authenticated');

-- ================================================
-- FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
    BEFORE UPDATE ON offers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_coins_updated_at
    BEFORE UPDATE ON crypto_coins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO counter FROM orders WHERE DATE(created_at) = CURRENT_DATE;
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- INITIAL DATA SEEDING (Optional)
-- ================================================

-- Insert default categories
INSERT INTO categories (id, name, icon, created_at, updated_at) VALUES
    ('cat-default-1', 'Video Call', 'Camera', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert default payment settings
INSERT INTO payment_settings (id, method, email, updated_at) VALUES
    ('gift-card', 'amazonGiftCard', 'ankiitasharmmaa@gmail.com', NOW())
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- GRANTS (Ensure service role has access)
-- ================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;
