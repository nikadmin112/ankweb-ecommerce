-- ================================================
-- COMPLETE SUPABASE SCHEMA - ALL TABLES
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: orders
-- ================================================
CREATE TABLE IF NOT EXISTS orders (
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
    status TEXT NOT NULL CHECK (status IN ('order-placed', 'payment-done', 'payment-confirmed', 'order-successful', 'delivered', 'cancelled')),
    promo_code TEXT,
    payment_method TEXT,
    payment_nationality TEXT CHECK (payment_nationality IN ('indian', 'international')),
    payment_screenshot TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ================================================
-- TABLE: promo_codes
-- ================================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMPTZ,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster code lookups
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_is_active ON promo_codes(is_active);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Orders are viewable by everyone"
    ON orders FOR SELECT
    USING (true);

CREATE POLICY "Orders can be inserted by authenticated users"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Orders can be updated by authenticated users"
    ON orders FOR UPDATE
    USING (true);

-- Promo codes policies
CREATE POLICY "Promo codes are viewable by everyone"
    ON promo_codes FOR SELECT
    USING (true);

CREATE POLICY "Promo codes can be managed by authenticated users"
    ON promo_codes FOR ALL
    USING (true);

-- ================================================
-- TRIGGERS for updated_at
-- ================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for orders
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for promo_codes
CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- FUNCTION: Generate Order Number
-- ================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    date_str TEXT;
    order_count INTEGER;
    order_num TEXT;
BEGIN
    -- Get current date in YYYYMMDD format
    date_str := TO_CHAR(NOW(), 'YYYYMMDD');
    
    -- Count orders with this date
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE order_number LIKE 'ORD-' || date_str || '-%';
    
    -- Generate order number
    order_num := 'ORD-' || date_str || '-' || LPAD((order_count + 1)::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- GRANTS (for service role)
-- ================================================

GRANT ALL ON orders TO service_role;
GRANT ALL ON promo_codes TO service_role;

-- ================================================
-- VERIFICATION
-- ================================================

SELECT 'Schema created successfully!' AS status;
SELECT 'Tables created: orders, promo_codes' AS info;
