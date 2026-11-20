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
  return session ? UserSchema.parse(session.user) : null;
}
