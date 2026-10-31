import { createFileRoute } from '@tanstack/react-router';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

async function POST(request: Request) {
  try {
    const user = await getRequiredUser();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ success: false, error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return Response.json(
        { success: false, error: 'Le fichier doit être une image' },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return Response.json(
        { success: false, error: 'Le fichier est trop volumineux (max 10MB)' },
        { status: 400 },
      );
    }

    const filename = `avatars/${user.id}`;

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: blob.url, updatedAt: new Date() },
    });

    return Response.json({ success: true, url: blob.url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return Response.json(
      { success: false, error: "Erreur lors du téléchargement de l'avatar" },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute('/api/profile/avatar')({
  server: {
    handlers: {
      POST: ({ request }) => POST(request),
    },
  },
});
