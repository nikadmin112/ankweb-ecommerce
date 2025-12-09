import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('screenshot') as File;
    const orderId = formData.get('orderId') as string;

    if (!file || !orderId) {
      return NextResponse.json({ error: 'Missing file or order ID' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'payment-screenshots');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${orderId}-${randomUUID()}.${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/payment-screenshots/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    console.error('Failed to upload screenshot:', error);
    return NextResponse.json({ error: 'Failed to upload screenshot' }, { status: 500 });
  }
}
