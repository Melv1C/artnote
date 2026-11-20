import '@tanstack/react-start/server-only';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { UserSchema } from '../schemas';
import { auth } from './auth';

// Server-only helpers: call them from server functions or server route handlers.

export const getSession = async () => {
  const session = auth.api.getSession({
    headers: getRequestHeaders(),
  });

  return session;
};

export const getUser = async () => {
  const session = await getSession();
  return session ? UserSchema.parse(session.user) : null;
};

export const getRequiredUser = async () => {
  const user = await getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  return user;
};
