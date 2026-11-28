import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Shop data: species → plate (Atkins's original + NYPL scan) → products.
// Each product is one Shopify product, made by one maker.

const species = defineCollection({
  loader: glob({ base: './src/content/species', pattern: '*.md' }),
  schema: z.object({
    acceptedName: z.string(),
    authority: z.string(),
    algaebaseId: z.string(),
    algaebaseUrl: z.string().url(),
    commonNames: z.array(z.string()).min(1),
    group: z.enum(['brown', 'red', 'green']),
    taxonomicShift: z.string(),
  }),
});

const plates = defineCollection({
  loader: glob({ base: './src/content/plates', pattern: '*.md' }),
  schema: z.object({
    species: reference('species'),
    atkinsLabel: z.string(),
    book: z.string(),
    part: z.string(),
    // A part's issue year only when a source dates it; otherwise the book's span.
    partDatePublished: z.string().nullable(),
    dateDisplay: z.string(),
    nypl: z.object({
      imageId: z.string(),
      uuid: z.string(),
      itemUrl: z.string().url(),
      copy: z.string(),
      rights: z.string().url(),
      credit: z.string(),
    }),
    auditStem: z.string(),
  }),
});

const products = defineCollection({
  loader: glob({ base: './src/content/products', pattern: '*.md' }),
  schema: z.object({
    title: z.string(),
    plate: reference('plates'),
    line: z.enum(['poster', 'fine-art-print']),
    related: z.array(reference('products')),
    sku: z.string(),
    size: z.string(),
    material: z.string(),
    edition: z.literal('open'),
    priceGbp: z.number().nullable(),
    maker: z.object({
      name: z.enum(['Printful', 'theprintspace']),
      product: z.string(),
      partnerProductId: z.string().nullable(),
    }),
    shopifyProductId: z.string().nullable(),
  }),
});

export const collections = { species, plates, products };
