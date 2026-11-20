import { ProfilePage } from '@/features/profile/components/profile-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});
