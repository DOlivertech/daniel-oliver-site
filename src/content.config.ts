import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    track: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const galleries = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/galleries' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    cover: z.string(),
    images: z.array(z.string()),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    dateLabel: z.string().optional(),
    circuit: z.string(),
    location: z.string(),
    series: z.string(),
    status: z.enum(['upcoming', 'completed']),
    result: z.string().optional(),
    link: z.string().optional(),
    track: z.string().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    track: z.string().optional(),
    draft: z.boolean().default(false),
    sourceUrl: z.string().optional(),
    sourceLabel: z.string().optional(),
  }),
});

export const collections = { posts, galleries, events, news };
