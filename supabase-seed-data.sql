-- ================================================
-- SUPABASE DATA SEEDING
-- Run this AFTER running supabase-schema.sql
-- ================================================

-- ================================================
-- SEED: Categories
-- ================================================
INSERT INTO categories (id, name, icon, created_at, updated_at) VALUES
    ('1765133422767', 'Video Call', 'Camera', '2025-12-07T18:50:22.767Z', '2025-12-07T18:50:22.767Z'),
    ('1765138382079', 'test', 'Gift', '2025-12-07T20:13:02.079Z', '2025-12-07T20:13:02.079Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    updated_at = EXCLUDED.updated_at;

-- ================================================
-- SEED: Products
-- ================================================
INSERT INTO products (id, name, description, full_description, price, discount, badge, category, image, rating, review_count, created_at, updated_at) VALUES
    ('1765133828690', 'Video Call', 'Video call for 10 Mins', 'Very good call\n100 Gurantee', 499, 100, 'New', 'Video Call', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 4.5, 458, '2025-12-07T18:57:08.690Z', '2025-12-08T17:55:59.299Z'),
    ('1765134739560', 'Premium Group', 'Best premium Group', '3000+ Videos', 799, 99, 'Limited', 'Video Call', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2lybHN8ZW58MHx8MHx8fDA%3D', 4.8, 1247, '2025-12-07T19:12:19.560Z', '2025-12-08T17:56:08.719Z'),
    ('1765216624884', 'Video Call 1', 'VC', NULL, 299, 99, 'New', 'Video Call', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 4.5, 265, '2025-12-08T17:57:04.884Z', '2025-12-08T17:57:04.884Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    full_description = EXCLUDED.full_description,
    price = EXCLUDED.price,
    discount = EXCLUDED.discount,
    badge = EXCLUDED.badge,
    category = EXCLUDED.category,
    image = EXCLUDED.image,
    rating = EXCLUDED.rating,
    review_count = EXCLUDED.review_count,
    updated_at = EXCLUDED.updated_at;

-- ================================================
-- SEED: Offers
-- ================================================
INSERT INTO offers (id, title, description, image, link, created_at, updated_at) VALUES
    ('1', 'Special Offer', 'Get 20% off on all services', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z'),
    ('2', 'Limited Time Deal', 'Premium packages at exclusive prices', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z'),
    ('3', 'New Services', 'Explore our latest offerings', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    link = EXCLUDED.link,
    updated_at = EXCLUDED.updated_at;

-- ================================================
-- SEED: Payment Settings
-- ================================================
INSERT INTO payment_settings (id, method, email, upi_id, bank_details, updated_at) VALUES
    ('gift-card', 'amazonGiftCard', 'ankiitasharmmaa@gmail.com', NULL, NULL, '2025-12-09T00:00:00.000Z'),
    ('remitly', 'remitly', NULL, 'test@ybl', 
     '{"accountHolderName": "Jhon Doe", "accountNumber": "123456789", "ifscCode": "ABCD111111", "address": "15 WING C DREM REC"}'::jsonb, 
     '2025-12-09T16:28:56.061Z')
ON CONFLICT (id) DO UPDATE SET
    method = EXCLUDED.method,
    email = EXCLUDED.email,
    upi_id = EXCLUDED.upi_id,
    bank_details = EXCLUDED.bank_details,
    updated_at = EXCLUDED.updated_at;

-- ================================================
-- SEED: Crypto Coins
-- ================================================
INSERT INTO crypto_coins (id, symbol, name, display_name, created_at, updated_at) VALUES
    ('coin-usdt', 'USDT', 'TetherUS', 'USDT TetherUS', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-bnb', 'BNB', 'BNB', 'BNB', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-btc', 'BTC', 'Bitcoin', 'BTC Bitcoin', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-ton', 'TON', 'Toncoin', 'TON Toncoin', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-eth', 'ETH', 'Ethereum', 'ETH Ethereum', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-dog', 'DOG', 'Dogs', 'DOG Dogs', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-cati', 'CATI', 'Catizen', 'CATI Catizen', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-sol', 'SOL', 'Solana', 'SOL Solana', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-xrp', 'XRP', 'XRP', 'XRP', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z')
ON CONFLICT (id) DO UPDATE SET
    symbol = EXCLUDED.symbol,
    name = EXCLUDED.name,
    display_name = EXCLUDED.display_name,
    updated_at = EXCLUDED.updated_at;

-- ================================================
-- SEED: Crypto Networks
-- ================================================
INSERT INTO crypto_networks (id, coin_id, name, full_name, deposit_address, created_at) VALUES
    -- USDT Networks
    ('net-usdt-bsc', 'coin-usdt', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-usdt-trc', 'coin-usdt', 'TRX', 'Tron (TRC20)', 'TEejAoACdiyKpHay2Tc4J1QJykDNCSG1cf', NOW()),
    ('net-usdt-eth', 'coin-usdt', 'ETH', 'Ethereum (ERC20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-usdt-ton', 'coin-usdt', 'TON', 'The Open Network (TON)', 'UQC-pr9qhXCJd4EIN-7dM9Tyz3RKBTotsoH8h5NEozcKz7ej', NOW()),
    
    -- BNB Networks
    ('net-1765301968407-uuig57iwz', 'coin-bnb', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302002095-e6bx9aef4', 'coin-bnb', 'OPBNB', 'opBNB', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW())
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these to verify data was inserted correctly:

-- Check products
SELECT COUNT(*) as product_count FROM products;

-- Check categories
SELECT COUNT(*) as category_count FROM categories;

-- Check crypto setup
SELECT 
    c.display_name, 
    COUNT(n.id) as network_count 
FROM crypto_coins c
LEFT JOIN crypto_networks n ON c.id = n.coin_id
GROUP BY c.id, c.display_name
ORDER BY c.display_name;

-- Check payment settings
SELECT id, method FROM payment_settings;

-- Summary
SELECT 
    'products' as table_name, COUNT(*) as rows FROM products
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'payment_settings', COUNT(*) FROM payment_settings
UNION ALL
SELECT 'crypto_coins', COUNT(*) FROM crypto_coins
UNION ALL
SELECT 'crypto_networks', COUNT(*) FROM crypto_networks
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'videos', COUNT(*) FROM videos;
