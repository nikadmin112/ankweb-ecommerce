-- ================================================
-- CLEAN UP PROMO CODES
-- Run this in Supabase SQL Editor if you need to delete existing promo codes
-- ================================================

-- View all existing promo codes
SELECT * FROM promo_codes ORDER BY created_at DESC;

-- Delete a specific promo code by code (uncomment and modify as needed)
-- DELETE FROM promo_codes WHERE code = 'QWERTY';
-- DELETE FROM promo_codes WHERE code = 'TEST';

-- Delete all promo codes (WARNING: This will delete ALL promo codes!)
-- DELETE FROM promo_codes;
