import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Share this page: the phone's share sheet where there is one, else the link is copied.
 */
export function ShareButton({ title, text }: { title: string; text?: string }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // Closing the share sheet is not a failure
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Sharing failed:', error);
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié');
    } catch (error) {
      console.error('Copying the link failed:', error);
      toast.error('Le lien n’a pas pu être copié');
    }
  };

  return (
    <Button variant="outline" className="rounded-full" onClick={share}>
      <Share2 />
      Partager
    </Button>
  );
}
