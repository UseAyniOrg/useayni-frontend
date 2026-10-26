import { useEffect, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { mediaService, type MediaCategory } from '@/services/mediaService';
import { apiErrorMessage } from '@/utils/apiError';

interface Props {
  category: MediaCategory;
  label: string;
  hint?: string;
  assetId?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  preserveExisting?: boolean;
  deferRemoval?: boolean;
  adminOrganizationId?: string;
  onUploadStateChange?: (uploading: boolean) => void;
  onChange: (assetId: string | undefined) => void;
}

export function MediaUploader({
  category,
  label,
  hint,
  assetId,
  visibility = 'PRIVATE',
  preserveExisting = false,
  deferRemoval = false,
  adminOrganizationId,
  onUploadStateChange,
  onChange,
}: Props) {
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let current = true;
    if (!assetId) {
      setPreviewUrl(undefined);
      return () => { current = false; };
    }
    const preview = visibility === 'PUBLIC'
      ? Promise.resolve(`/m/${assetId}`)
      : mediaService.getPrivateUrl(assetId);
    preview
      .then((url) => { if (current) setPreviewUrl(url); })
      .catch(() => { if (current) setPreviewUrl(undefined); });
    return () => { current = false; };
  }, [assetId, visibility]);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setWorking(true);
    onUploadStateChange?.(true);
    setProgress(0);
    setError('');
    try {
      const nextId = await mediaService.upload(file, category, setProgress, visibility, adminOrganizationId);
      if (assetId && !preserveExisting) await mediaService.remove(assetId);
      onChange(nextId);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Não foi possível enviar o arquivo.'));
    } finally {
      setWorking(false);
      onUploadStateChange?.(false);
    }
  };

  const remove = async () => {
    if (!assetId) return;
    if (deferRemoval) {
      onChange(undefined);
      return;
    }
    setWorking(true);
    setError('');
    try {
      await mediaService.remove(assetId);
      onChange(undefined);
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Não foi possível remover a mídia.'));
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-2 rounded-md border p-3">
      <label className="block text-sm font-medium">
        {label}
        <input
          className="mt-2 block w-full text-sm"
          type="file"
          accept={category === 'document' ? 'application/pdf,image/webp,image/jpeg,image/png' : 'image/webp,image/jpeg,image/png'}
          onChange={upload}
          disabled={working}
        />
      </label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {working && (
        <div className="space-y-1" aria-live="polite">
          <progress className="w-full" max={100} value={progress} />
          <p className="text-xs text-muted-foreground">
            {progress ? `Enviando ${progress}%` : 'Preparando arquivo...'}
          </p>
        </div>
      )}
      {previewUrl && (
        <img src={previewUrl} alt={`Prévia: ${label}`} className="max-h-48 max-w-full rounded object-contain" />
      )}
      {assetId && (
        <Button type="button" variant="outline" size="sm" disabled={working} onClick={remove}>
          Remover mídia
        </Button>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
