import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// use Web Crypto API to generate random UUID
function generateUUID() {
  return crypto.randomUUID();
}

// add file size limit and allowed file types
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf'
]);

const S3 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'please provide file' },
        { status: 400 }
      );
    }

    // validate file type
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'unsupported file type' },
        { status: 400 }
      );
    }

    // validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'file size exceeds the limit' },
        { status: 400 }
      );
    }

    // generate more secure file name
    const fileExtension = file.name.split('.').pop();
    const randomName = generateUUID();
    const fileName = `${randomName}.${fileExtension}`;
    
    // modify: directly use arrayBuffer() without converting to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // upload to r2
    await S3.send(
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        Key: fileName,
        Body: uint8Array,
        ContentType: file.type,
      })
    );

    // build public access url
    const fileUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${fileName}`;

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'upload failed, please try again later' }, 
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; 