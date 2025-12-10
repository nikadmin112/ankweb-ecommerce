# Promo Code Fix - Add Support for Free Service Product IDs

## Problem
The `discount_value` column in `promo_codes` table is type `numeric`, but we need to store product IDs (text) for `free_service` promo type.

## Solution
Add a new column `free_product_id` to store product IDs for free_service promos.

## SQL Migration

Run this in your Supabase SQL Editor:

```sql
-- Add new column for free service product IDs
ALTER TABLE promo_codes 
ADD COLUMN free_product_id TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN promo_codes.free_product_id IS 'Product ID for free_service promo type';
```

## After Running Migration

The code will automatically use:
- `discount_value` for percentage, fixed, and bogo types (numeric)
- `free_product_id` for free_service type (text product ID)
