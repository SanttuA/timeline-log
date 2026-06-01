import { z } from 'zod';

import { isDateString } from './date';

const dateStringSchema = z
  .string()
  .trim()
  .refine(isDateString, 'Use a valid date in YYYY-MM-DD format.');

const httpUrlSchema = z
  .string()
  .trim()
  .max(2048, 'Links must be 2048 characters or fewer.')
  .refine((value) => {
    if (value.length === 0) {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Links must be empty or a valid http(s) URL.');

export const idSchema = z.number().int().positive();

export const searchQuerySchema = z.string().trim().max(200).default('');

export const periodInputSchema = z
  .object({
    name: z.string().trim().min(1, 'Period name is required.').max(120),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  })
  .superRefine((value, context) => {
    if (value.startDate > value.endDate) {
      context.addIssue({
        code: 'custom',
        message: 'Start date must be before or equal to end date.',
        path: ['startDate'],
      });
    }
  });

export const periodUpdateSchema = periodInputSchema.extend({
  id: idSchema,
});

export const entryInputSchema = z.object({
  periodId: idSchema,
  company: z.string().trim().min(1, 'Company or institution is required.').max(160),
  title: z.string().trim().min(1, 'Title is required.').max(180),
  entryDate: dateStringSchema,
  link: httpUrlSchema.default(''),
  notes: z.string().trim().max(6000).default(''),
});

export const entryUpdateSchema = entryInputSchema.extend({
  id: idSchema,
});

export const linkOpenSchema = httpUrlSchema.refine(
  (value) => value.length > 0,
  'Link is required.',
);

export function formatValidationError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues.map((issue) => issue.message).join(' ');
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected error.';
}
