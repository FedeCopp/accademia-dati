import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const risorsa = z.object({ titolo: z.string(), url: z.url() });

/** Esercizio eseguibile nel browser, corretto in automatico. */
const esercizio = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titolo: z.string(),
  consegna: z.string(),
  linguaggio: z.enum(['sql', 'python']),
  dataset: z.array(z.string()).default([]),
  iniziale: z.string(),
  soluzione: z.string(),
  /** SQL: conta anche l'ordine delle righe (quando la consegna chiede ORDER BY). */
  ordinato: z.boolean().default(false),
  /** Python: controlli eseguiti dopo il codice dello studente. */
  test: z.array(z.object({ codice: z.string(), messaggio: z.string() })).default([]),
  suggerimenti: z.array(z.string()).default([]),
}).refine((e) => e.linguaggio === 'sql' || e.test.length > 0, { message: 'Gli esercizi Python hanno bisogno di almeno un test' });

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
    esercizi: z.array(esercizio).default([]),
  }),
});

const glossario = defineCollection({
  loader: file('./src/content/glossario.json'),
  schema: z.object({ termine: z.string(), definizione: z.string() }),
});

export const collections = { fasi, settimane, glossario };
