import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getRequiredUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non authentifié' },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string;
    const caption = formData.get('caption') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 },
      );
    }

    // Validate file size (10MB max for API routes)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 },
      );
    }

    // Generate unique filename with timestamp
    const filename = `artworks/${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Create Image record in database
    const image = await prisma.image.create({
      data: {
        url: blob.url,
        alt: alt || null,
        caption: caption || null,
        width: null, // Could be extracted from image if needed
        height: null, // Could be extracted from image if needed
        size: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      url: image.url,
      imageId: image.id,
      imageData: {
        id: image.id,
        url: image.url,
        alt: image.alt,
        caption: image.caption,
        width: image.width,
        height: image.height,
        size: image.size,
        mimeType: image.mimeType,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors du téléchargement de l'image" },
      { status: 500 },
    );
  }
}
