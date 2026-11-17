import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const risorsa = z.object({ titolo: z.string(), url: z.url() });

const fasi = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/fasi' }),
  schema: z.object({
    numero: z.number().int(),
    titolo: z.string(),
    mesi: z.string(),
    sintesi: z.string(),
    strumenti: z.array(z.string()),
    progetto: z.string(),
    risorse: z.array(risorsa).default([]),
  }),
});

const settimane = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/settimane' }),
  schema: z.object({
    numero: z.number().int().min(1).max(12),
    titolo: z.string(),
    sottotitolo: z.string(),
    obiettivo: z.string(),
    studio: z.array(z.string()),
    esercizio: z.string(),
    risorse: z.array(risorsa),
    fatto: z.array(z.string()).optional(),
  }),
});

const glossario = defineCollection({
  loader: file('./src/content/glossario.json'),
  schema: z.object({ termine: z.string(), definizione: z.string() }),
});

export const collections = { fasi, settimane, glossario };
