import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { initials } from '@/lib/initials';
import { cn } from '@/lib/utils';

/** A person's picture, or their initials without one. */
export function UserAvatar({
  user,
  src = user.image,
  className,
}: {
  user: { name: string; image?: string | null };
  /** Shown instead of the saved picture, such as a new one before it is uploaded */
  src?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn('size-8', className)}>
      <AvatarImage src={src || undefined} alt="" />
      <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );
}
