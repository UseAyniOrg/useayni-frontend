import { z } from 'zod';

const optionalUrl = z.string().trim().url('Informe uma URL válida.')
  .refine(value => value.startsWith('https://'), 'Use uma URL HTTPS.').or(z.literal(''));
const optionalAsset = z.string().uuid('Selecione uma imagem válida.').or(z.literal(''));

export const editorFormSchema = z.object({
  theme: z.object({
    primary_color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use uma cor hexadecimal.'),
    secondary_color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use uma cor hexadecimal.'),
    background_color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use uma cor hexadecimal.'),
    logo_background_color: z.string().regex(/^#[0-9a-f]{6}$/i, 'Use uma cor hexadecimal.'),
    logo_asset_id: optionalAsset,
    favicon_asset_id: optionalAsset,
    font_family: z.enum(['Inter', 'Lato', 'Poppins']),
  }),
  seo: z.object({ title: z.string().max(200), description: z.string().max(1000), og_image_asset_id: optionalAsset }),
  social_links: z.object({ instagram: optionalUrl, linkedin: optionalUrl, facebook: optionalUrl, youtube: optionalUrl, tiktok: optionalUrl }),
  contact: z.object({
    address: z.string().max(1000), phone: z.string().max(40), whatsapp: z.string().max(40),
    email: z.string().trim().email('Informe um email válido.').or(z.literal('')), map_url: optionalUrl,
  }),
});

export type EditorFormValues = z.infer<typeof editorFormSchema>;