import { z } from 'zod';
import { fr } from 'zod/locales';

// Validation messages reach the UI: default them to French. Import `z` from here, never from
// 'zod' (lint enforces it), so the locale is set wherever a schema is defined.
z.config(fr());

export { z };
