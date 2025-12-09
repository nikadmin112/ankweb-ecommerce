-- Fix orders table to match the application schema
-- Run this in Supabase SQL Editor

-- Add missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_screenshot TEXT;

-- If screenshot_url exists, migrate data to payment_screenshot
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'screenshot_url'
    ) THEN
        UPDATE orders SET payment_screenshot = screenshot_url WHERE screenshot_url IS NOT NULL;
        ALTER TABLE orders DROP COLUMN screenshot_url;
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
