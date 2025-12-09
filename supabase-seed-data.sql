-- ================================================
-- SUPABASE DATA SEEDING
-- Run this AFTER running supabase-schema.sql
-- ================================================

-- ================================================
-- SEED: Categories
-- ================================================
-- Delete existing categories first to avoid conflicts
DELETE FROM categories;

INSERT INTO categories (id, name, icon, created_at, updated_at) VALUES
    ('1765133422767', 'Video Call', 'Camera', '2025-12-07T18:50:22.767Z', '2025-12-07T18:50:22.767Z'),
    ('1765138382079', 'Test Category', 'Gift', '2025-12-07T20:13:02.079Z', '2025-12-07T20:13:02.079Z');

-- ================================================
-- SEED: Products
-- ================================================
-- Delete existing products first
DELETE FROM products;

INSERT INTO products (id, name, description, full_description, price, discount, badge, category, image, rating, review_count, created_at, updated_at) VALUES
    ('1765133828690', 'Video Call - 10 Minutes', 'Video call for 10 Mins', 'Very good call\n100 Gurantee', 499, 100, 'New', 'Video Call', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 4.5, 458, '2025-12-07T18:57:08.690Z', '2025-12-08T17:55:59.299Z'),
    ('1765134739560', 'Premium Group', 'Best premium Group', '3000+ Videos', 799, 99, 'Limited', 'Video Call', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2lybHN8ZW58MHx8MHx8fDA%3D', 4.8, 1247, '2025-12-07T19:12:19.560Z', '2025-12-08T17:56:08.719Z'),
    ('1765216624884', 'Video Call - Quick', 'VC', NULL, 299, 99, 'New', 'Video Call', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', 4.5, 265, '2025-12-08T17:57:04.884Z', '2025-12-08T17:57:04.884Z');

-- ================================================
-- SEED: Offers
-- ================================================
-- Delete existing offers first
DELETE FROM offers;

INSERT INTO offers (id, title, description, image, link, created_at, updated_at) VALUES
    ('1', 'Special Offer', 'Get 20% off on all services', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z'),
    ('2', 'Limited Time Deal', 'Premium packages at exclusive prices', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z'),
    ('3', 'New Services', 'Explore our latest offerings', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', '/shop', '2025-12-07T18:29:15.893Z', '2025-12-07T18:29:15.893Z');

-- ================================================
-- SEED: Payment Settings
-- ================================================
-- Delete existing payment settings first
DELETE FROM payment_settings;

INSERT INTO payment_settings (id, method, email, upi_id, bank_details, updated_at) VALUES
    ('gift-card', 'amazonGiftCard', 'ankiitasharmmaa@gmail.com', NULL, NULL, '2025-12-09T00:00:00.000Z'),
    ('remitly', 'remitly', NULL, 'test@ybl', 
     '{"accountHolderName": "Jhon Doe", "accountNumber": "123456789", "ifscCode": "ABCD111111", "address": "15 WING C DREM REC"}'::jsonb, 
     '2025-12-09T16:28:56.061Z');

-- ================================================
-- SEED: Crypto Coins
-- ================================================
-- Delete existing crypto data first (cascades to networks)
DELETE FROM crypto_networks;
DELETE FROM crypto_coins;

INSERT INTO crypto_coins (id, symbol, name, display_name, created_at, updated_at) VALUES
    ('coin-usdt', 'USDT', 'TetherUS', 'USDT TetherUS', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-bnb', 'BNB', 'BNB', 'BNB', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-btc', 'BTC', 'Bitcoin', 'BTC Bitcoin', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-ton', 'TON', 'Toncoin', 'TON Toncoin', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-eth', 'ETH', 'Ethereum', 'ETH Ethereum', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-dog', 'DOG', 'Dogs', 'DOG Dogs', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-cati', 'CATI', 'Catizen', 'CATI Catizen', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-sol', 'SOL', 'Solana', 'SOL Solana', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z'),
    ('coin-xrp', 'XRP', 'XRP', 'XRP', '2025-12-09T00:00:00.000Z', '2025-12-09T00:00:00.000Z');

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
    ('net-1765302009052-szl0web19', 'coin-bnb', 'OPBNB', 'opBNB', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    
    -- BTC Networks
    ('net-1765302042032-eacrj984y', 'coin-btc', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302065713-7e92wv0ww', 'coin-btc', 'BTC', 'Bitcoin', '1ABfnRUSPksVAp7zkkiS13bKUY9E4KqCfo', NOW()),
    
    -- TON Networks
    ('net-1765302141021-egnk4gab0', 'coin-ton', 'TON', 'The Open Network (TON)', 'UQC-pr9qhXCJd4EIN-7dM9Tyz3RKBTotsoH8h5NEozcKz7ej', NOW()),
    
    -- ETH Networks
    ('net-1765302182246-3hbv3drie', 'coin-eth', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302226272-k7ifm3ir1', 'coin-eth', 'ARBITRUM', 'Arbitrum One', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302252715-l91pw4hvr', 'coin-eth', 'ETH', 'Ethereum (ERC20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    
    -- DOG Networks
    ('net-1765302113653-0qfnwn58t', 'coin-dog', 'TON', 'The Open Network (TON)', 'UQC-pr9qhXCJd4EIN-7dM9Tyz3RKBTotsoH8h5NEozcKz7ej', NOW()),
    
    -- CATI Networks
    ('net-1765302282553-ekj98642u', 'coin-cati', 'TON', 'The Open Network (TON)', 'UQC-pr9qhXCJd4EIN-7dM9Tyz3RKBTotsoH8h5NEozcKz7ej', NOW()),
    
    -- SOL Networks
    ('net-1765302303907-lauellagq', 'coin-sol', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302328004-2rkobtcoh', 'coin-sol', 'SOL', 'Solana', 'E9vF3udL9ANkmavTNkss1VMTX6rz66mGeBio2427HJk2', NOW()),
    
    -- XRP Networks
    ('net-1765302353455-gjfsravwd', 'coin-xrp', 'BSC', 'BNB Smart Chain (BEP20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW()),
    ('net-1765302378419-dlv9nrns2', 'coin-xrp', 'ETH', 'Ethereum (ERC20)', '0x1284ebf089cdb12fd950af769346b845be61ffb4', NOW());

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
