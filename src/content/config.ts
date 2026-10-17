import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // z.coerce.date() is required: YAML parses dates as strings, coerce converts them
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

// Landing page content: welcome text (body) and selected posts (frontmatter)
const start = defineCollection({
  type: 'content',
  schema: z.object({
    texter: z
      .array(
        z.object({
          slug: z.string().default(''),
          rad: z.string().default(''),
        })
      )
      .default([]),
  }),
});

export const collections = { posts, start };
