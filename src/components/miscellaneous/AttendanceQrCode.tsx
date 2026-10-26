import { QRCodeSVG } from 'qrcode.react';

export function AttendanceQrCode({ token }: { token: string }) {
  return <div className="space-y-3 rounded-lg border bg-white p-4 text-center text-slate-950">
    <QRCodeSVG value={token} size={240} level="M" marginSize={4} title="QR Code para validar sua presença" className="mx-auto h-auto max-w-full" />
    <p className="text-sm">Apresente este QR Code à equipe responsável pela presença.</p>
    <details className="text-xs">
      <summary className="cursor-pointer">Mostrar código para validação manual</summary>
      <code className="mt-2 block break-all select-all">{token}</code>
    </details>
  </div>;
}
