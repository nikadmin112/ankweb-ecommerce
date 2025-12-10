import { getServiceClient } from './supabase';

export async function uploadImageToSupabase(
  file: File,
  folder: 'products' | 'banners' | 'categories' | 'payment-screenshots'
): Promise<string> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error('Supabase not configured');

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImageFromSupabase(imageUrl: string): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) return;

  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/uploads/');
    if (urlParts.length < 2) return;
    
    const filePath = urlParts[1];
    
    const { error } = await supabase.storage
      .from('uploads')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
    }
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}
