# Supabase Storage Setup for Image Uploads

## Steps to Configure Storage:

1. **Go to Supabase Dashboard** → Your Project → Storage

2. **Create a new bucket:**
   - Click "New Bucket"
   - Bucket name: `uploads`
   - Set as **Public bucket** (so uploaded images can be viewed)
   - Click "Create bucket"

3. **Configure bucket policies:**
   - Go to the `uploads` bucket
   - Click on "Policies" tab
   - Click "New Policy" and add the following policies:

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
  ├── products/
  │   ├── 1733943257902-abc123.jpg
  │   └── 1733943258903-def456.png
  ├── banners/
  │   ├── 1733943259904-ghi789.jpg
  │   └── 1733943260905-jkl012.png
  ├── categories/
  │   ├── 1733943261906-mno345.svg
  │   └── 1733943262907-pqr678.png
  └── payment-screenshots/
      ├── ORD-123456-ABC123.jpg
      └── ORD-123456-DEF456.png
```

## What This Enables:
- ✅ **Product Images**: Upload product/service images directly from admin panel
- ✅ **Banner Images**: Upload promotional banner images for offers carousel
- ✅ **Category Icons**: Upload custom category icon images
- ✅ **Payment Screenshots**: Customers can upload payment proof after ordering
- ✅ Files are stored in Supabase Storage (works on Vercel)
- ✅ Public URLs are generated automatically for all uploads
- ✅ Admin panel supports both URL input and file upload
- ✅ Files are organized by type in separate folders

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
