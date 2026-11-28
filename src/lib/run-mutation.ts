import { toast } from 'sonner';

/**
 * Run a change from the UI: `mutate` calls the server function and refreshes what shows it. On
 * success, confirm with `success`; on failure, log the error and show `failure`, never the error's
 * own message, which can carry internals. Resolves to whether it succeeded.
 */
export async function runMutation(
  mutate: () => Promise<unknown>,
  { success, failure }: { success?: string; failure: string },
): Promise<boolean> {
  try {
    await mutate();
    if (success) toast.success(success);
    return true;
  } catch (error) {
    console.error(failure, error);
    toast.error(failure);
    return false;
  }
}
