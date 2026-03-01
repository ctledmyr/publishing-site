import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // z.coerce.date() is required: YAML parses dates as strings, coerce converts them
    date: z.coerce.date(),
    slug: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
