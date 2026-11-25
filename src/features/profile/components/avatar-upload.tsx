import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { runMutation } from '@/lib/run-mutation';
import { uploadAvatar } from '../actions/profile-mutations';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export function AvatarUpload({ user }: { user: { name: string; image?: string | null } }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { refetch } = useAuth();
  const [preview, setPreview] = useState(user.image);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    await runMutation(
      async () => {
        const { url } = await uploadAvatar({ data: formData });
        setPreview(url);
        await refetch();
      },
      { success: 'Avatar mis à jour', failure: 'Erreur lors du téléchargement' },
    );
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <UserAvatar user={user} src={preview} className="size-24 *:text-lg" />
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
        {isUploading ? 'Envoi…' : 'Changer'}
      </Button>
    </div>
  );
}
