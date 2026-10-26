import imageCompression from 'browser-image-compression';
import { api } from '@/lib/api';

export type MediaCategory =
  | 'avatar'
  | 'logo'
  | 'event-cover'
  | 'event-banner'
  | 'event-map'
  | 'sponsor-art'
  | 'form-cover'
  | 'miscellaneous-cover'
  | 'org-home-banner'
  | 'org-home-card'
  | 'org-home-logo'
  | 'org-home-avatar'
  | 'document';

const IMAGE_LIMIT_BYTES = 2 * 1024 * 1024;
const DOCUMENT_LIMIT_BYTES = 10 * 1024 * 1024;

function browserSupportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
}

async function compressImage(file: File, category: MediaCategory): Promise<File> {
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  const outputType = browserSupportsWebP() ? 'image/webp' : 'image/jpeg';
  const maxDimension = ['avatar', 'logo', 'org-home-avatar', 'org-home-logo'].includes(category)
    ? 512
    : category === 'org-home-banner'
      ? 1920
      : category === 'org-home-card'
        ? 1200
        : 1600;
  const compressed = await imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: maxDimension,
    initialQuality: 0.8,
    useWebWorker: true,
    fileType: outputType,
    preserveExif: false,
  });
  return new File([compressed], `upload.${outputType === 'image/webp' ? 'webp' : 'jpg'}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export const mediaService = {
  async upload(
    source: File,
    category: MediaCategory,
    onProgress: (progress: number) => void,
    visibility: 'PUBLIC' | 'PRIVATE' = 'PRIVATE',
    adminOrganizationId?: string,
  ): Promise<string> {
    let file = source;
    if (source.type.startsWith('image/')) {
      file = await compressImage(source, category);
      if (file.size > IMAGE_LIMIT_BYTES) {
        throw new Error('A imagem ainda excede 2 MB após a compressão.');
      }
    } else if (source.size > DOCUMENT_LIMIT_BYTES) {
      throw new Error('Documentos devem ter no máximo 10 MB.');
    }

    const allowedTypes = new Set([
      'application/pdf',
      'image/webp',
      'image/jpeg',
      'image/png',
    ]);
    if (!allowedTypes.has(file.type)) {
      throw new Error('Formato não permitido. Use PDF, WebP, JPEG ou PNG.');
    }

    const uploadPath = adminOrganizationId
      ? `/org-home/admin/organizations/${adminOrganizationId}/media/uploads`
      : '/media/uploads';
    const intent = await api.post<{
      asset_id: string;
    }>(uploadPath, {
      category,
      mime_type: file.type,
      size_bytes: file.size,
      visibility,
    });
    const contentPath = adminOrganizationId
      ? `/org-home/admin/organizations/${adminOrganizationId}/media/${intent.data.asset_id}/content`
      : `/media/uploads/${intent.data.asset_id}/content`;
    await api.put(contentPath, file, {
      headers: { 'Content-Type': file.type },
      transformRequest: [(data) => data],
      onUploadProgress: (event) => {
        if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    onProgress(100);
    return intent.data.asset_id;
  },

  async getPrivateUrl(assetId: string): Promise<string> {
    const response = await api.get<{ url: string }>(`/media/${assetId}/url`);
    return response.data.url;
  },

  async getPublicUrl(assetId: string): Promise<string> {
    const response = await api.get<{ url: string }>(`/public/media/${assetId}/url`);
    return response.data.url;
  },

  async remove(assetId: string): Promise<void> {
    await api.delete(`/media/${assetId}`);
  },
};
