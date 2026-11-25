import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';
import { ac, roles } from './permissions';

const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles,
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
