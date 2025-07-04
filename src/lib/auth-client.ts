import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';
import {
  ac,
  admin as adminRole,
  user,
  writer,
} from './permissions';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin: adminRole,
        writer,
        user,
      },
    }),
  ],
});

export const { useSession, signIn, signUp, signOut } = authClient;
