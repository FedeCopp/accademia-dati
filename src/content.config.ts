import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const risorsa = z.object({ titolo: z.string(), url: z.url() });
/** Video consigliati in italiano, collegati a YouTube (niente iframe). */
const video = z.object({
  titolo: z.string(),
  url: z.url().refine((u) => /^https:\/\/(www\.)?youtube\.com\/(watch\?v=|playlist\?list=)/.test(u), 'URL YouTube non valido'),
  autore: z.string(),
  nota: z.string().optional(),
});

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
    video: z.array(video).default([]),
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
    video: z.array(video).default([]),
    fatto: z.array(z.string()).optional(),
  }),
});

const glossario = defineCollection({
  loader: file('./src/content/glossario.json'),
  schema: z.object({ termine: z.string(), definizione: z.string() }),
});

export const collections = { fasi, settimane, glossario };
