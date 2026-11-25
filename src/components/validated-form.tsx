import { z } from '@/lib/zod';
import { useState, useTransition, type FormEvent } from 'react';

/**
 * A form read from its fields' values (`FormData`) and validated with the schema its server
 * function uses. A refused submission shows each field's first message beside it and focuses the
 * first field at fault; a valid one runs `save` in a transition.
 *
 * Submits through `onSubmit`, not a form action: React resets a form after its action runs, which
 * would empty the fields of a refused save or bring back the saved values.
 */
export function useValidatedForm<S extends z.ZodObject>(
  schema: S,
  save: (data: z.output<S>) => Promise<unknown>,
) {
  type Field = keyof z.output<S> & string;
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Partial<Record<Field, string[]>>>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const fieldErrors = z.flattenError(parsed.error).fieldErrors as Partial<
        Record<Field, string[]>
      >;
      setErrors(fieldErrors);
      const first = Array.from(form.elements).find(element =>
        Object.hasOwn(fieldErrors, element.id),
      );
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});
    startTransition(async () => {
      await save(parsed.data);
    });
  };

  /** A field's `id` and `name`, the schema key, and its invalid state pointing to its message. */
  const field = (name: Field) => ({
    id: name,
    name,
    ...(errors[name] && { 'aria-invalid': true, 'aria-describedby': `${name}-error` }),
  });

  /** The field's first message, placed beside it. */
  const fieldError = (name: Field) => {
    const message = errors[name]?.[0];
    return message ? (
      <p id={`${name}-error`} className="text-sm text-destructive">
        {message}
      </p>
    ) : null;
  };

  return { onSubmit, isPending, field, fieldError };
}
