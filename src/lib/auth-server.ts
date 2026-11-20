import '@tanstack/react-start/server-only';
import { UserSchema } from '@/schemas/user';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { auth } from './auth';

/**
 * The signed-in user of the current request, or null. Server functions read the user from the
 * guard middleware's `context.user` instead of calling this again.
 */
export async function getUser() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session) return null;
  // A user whose row does not fit the schema (e.g. an unknown role) is treated as signed out
  const user = UserSchema.safeParse(session.user);
  if (!user.success) console.error('Session user does not match UserSchema:', user.error.issues);
  return user.data ?? null;
}
