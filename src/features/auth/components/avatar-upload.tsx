'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface AvatarUploadProps {
  user: { name: string; image?: string | null };
  editable?: boolean;
}

export function AvatarUpload({ user, editable = false }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refetch } = useSession();
  const [preview, setPreview] = useState<string | null>(user.image ?? null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du téléchargement');
      }
      setPreview(data.url);
      toast.success('Avatar mis à jour');
      await refetch();
    } catch (error) {
      console.error('Avatar upload failed:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src={preview || undefined} alt={user.name} />
        <AvatarFallback className="text-lg">
          {user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Upload...' : 'Changer'}
          </Button>
        </>
      )}
    </div>
  );
}
