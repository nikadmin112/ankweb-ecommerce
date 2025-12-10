import { NextResponse } from 'next/server';
import { uploadImageToSupabase } from '@/lib/supabase-upload';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as 'products' | 'banners' | 'categories' | 'payment-screenshots';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder) {
      return NextResponse.json({ error: 'No folder specified' }, { status: 400 });
    }

    const url = await uploadImageToSupabase(file, folder);
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    );
  }
}
