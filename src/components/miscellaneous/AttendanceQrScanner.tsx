import { useEffect, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';
import { Button } from '@/components/ui/button';

export function AttendanceQrScanner({ onRead, disabled, paused = false }: { onRead: (token: string) => Promise<void>; disabled: boolean; paused?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [scanning, setScanning] = useState(false);
  const [readingFile, setReadingFile] = useState(false);
  const [error, setError] = useState('');
  const readVersion = useRef(0);
  useEffect(() => () => { readVersion.current++; }, []);
  useEffect(() => { if (disabled) setScanning(false); }, [disabled]);
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let controls: IScannerControls | undefined;
    let stream: MediaStream | undefined;
    let processing = false;
    let lastToken = '';
    let lastSeenAt = 0;
    const stop = () => { controls?.stop(); stream?.getTracks().forEach(track => track.stop()); };
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('A câmera exige HTTPS ou localhost e um navegador compatível. Use uma imagem ou cole o código.');
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (cancelled || !video.current) return;
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } });
        if (cancelled || !video.current) { stop(); return; }
        controls = await new BrowserQRCodeReader().decodeFromStream(
          stream, video.current,
          (result, failure, scanner) => {
            if (cancelled) return;
            if (result) {
              const token = result.getText();
              if (token === lastToken) { lastSeenAt = Date.now(); return; }
              if (processing || pausedRef.current) return;
              lastToken = token;
              lastSeenAt = Date.now();
              processing = true;
              setError('');
              void Promise.resolve().then(() => onReadRef.current(token)).catch(() => {
                if (!cancelled) setError('Não foi possível validar este QR Code. Retire o código da câmera e tente novamente.');
              }).finally(() => { processing = false; });
            } else if (failure && !['NotFoundException', 'ChecksumException', 'FormatException'].includes(
              'getKind' in failure && typeof failure.getKind === 'function' ? failure.getKind() : failure.name,
            )) {
              cancelled = true;
              scanner.stop();
              stop();
              setScanning(false);
              setError('Não foi possível ler a câmera. Tente novamente ou envie uma imagem do QR Code.');
            } else if (Date.now() - lastSeenAt > 1200) {
              lastToken = '';
            }
          },
        );
        if (cancelled) controls.stop();
      } catch (cause: unknown) {
        stop();
        if (!cancelled) {
          setScanning(false);
          const name = cause instanceof Error ? cause.name : '';
          setError(name === 'NotAllowedError' || name === 'SecurityError'
            ? 'Acesso à câmera bloqueado. Permita o uso da câmera nas configurações do navegador e tente novamente. Se estiver em outro aplicativo, abra este site no navegador.'
            : name === 'NotFoundError'
              ? 'Nenhuma câmera foi encontrada neste dispositivo. Envie uma imagem do QR Code ou cole o código.'
              : name === 'NotReadableError' || name === 'AbortError'
                ? 'A câmera está ocupada ou indisponível. Feche outros aplicativos que a utilizam e tente novamente.'
                : cause instanceof Error && cause.message.startsWith('A câmera exige')
                  ? cause.message : 'Não foi possível abrir a câmera. Confira a permissão e se ela está disponível.');
        }
      }
    };
    void start();
    return () => { cancelled = true; stop(); };
  }, [scanning]);
  const readFile = async (file: File) => {
    const version = ++readVersion.current;
    setReadingFile(true); setError(''); setScanning(false);
    const url = URL.createObjectURL(file);
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      if (version !== readVersion.current) return;
      await onReadRef.current(result.getText());
    } catch {
      if (version === readVersion.current) setError('Não foi possível ler um QR Code nesta imagem. Escolha uma imagem nítida ou cole o código.');
    } finally { URL.revokeObjectURL(url); if (version === readVersion.current) setReadingFile(false); }
  };
  return <div className="space-y-3 rounded-lg border p-3">
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" disabled={disabled || readingFile || (paused && !scanning)} onClick={() => { setError(''); setScanning(current => !current); }}>
        {scanning ? 'Parar câmera' : 'Ler QR Code pela câmera'}
      </Button>
      <label className="grid gap-1 text-xs"><span>{readingFile ? 'Lendo imagem...' : 'Ou selecionar imagem do QR Code'}</span>
        <input aria-label="Imagem do QR Code" type="file" accept="image/*" disabled={disabled || paused || readingFile || scanning}
          onChange={event => { const file = event.target.files?.[0]; if (file) void readFile(file); event.target.value = ''; }} />
      </label>
    </div>
    {scanning && <video ref={video} autoPlay muted playsInline aria-label="Leitor de QR Code pela câmera" className="max-h-80 w-full rounded-lg bg-black" />}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">A leitura envia o código para validar nesta sessão. Câmera e imagem são processadas no dispositivo, sem envio a serviços externos.</p>
  </div>;
}
