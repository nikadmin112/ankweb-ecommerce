# Supabase Storage Setup for Payment Screenshots

## Steps to Configure Storage:

1. **Go to Supabase Dashboard** → Your Project → Storage

2. **Create a new bucket:**
   - Click "New Bucket"
   - Bucket name: `uploads`
   - Set as **Public bucket** (so uploaded screenshots can be viewed)
   - Click "Create bucket"

3. **Configure bucket policies:**
   - Go to the `uploads` bucket
   - Click on "Policies"
   - Add the following policies:

### Policy 1: Allow Public Read Access
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');
```

### Policy 2: Allow Authenticated Upload
```sql
CREATE POLICY "Allow service role to upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'uploads' 
  AND auth.role() = 'service_role'
);
```

### Policy 3: Allow Authenticated Delete (for cleanup)
```sql
CREATE POLICY "Allow service role to delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'service_role'
);
```

## Folder Structure in Bucket:
```
uploads/
  └── payment-screenshots/
      ├── ORD-123456-ABC123.jpg
      ├── ORD-123456-DEF456.png
      └── ...
```

## What This Enables:
- ✅ Customers can upload payment screenshots after placing orders
- ✅ Files are stored in Supabase Storage (works on Vercel)
- ✅ Public URLs are generated for viewing screenshots
- ✅ Admin panel can display uploaded screenshots
- ✅ Files are organized by order ID

## Alternative: Simpler Setup
If you want to make it completely public for uploads (not recommended for production):

```sql
-- Allow anyone to upload
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads');

-- Allow anyone to read
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');
```

However, the service role approach is more secure as it uses your `SUPABASE_SERVICE_ROLE_KEY`.
