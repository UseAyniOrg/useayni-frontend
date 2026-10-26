import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Props {
  src: string;
  alt: string;
  children: ReactNode;
  triggerClassName?: string;
}

export function MediaLightbox({ src, alt, children, triggerClassName }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={triggerClassName} aria-label={`Ampliar imagem: ${alt}`}>
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl gap-3 border-white/10 bg-slate-950 p-3 text-white sm:p-5">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle>{alt}</DialogTitle>
          <DialogDescription className="sr-only">Imagem ampliada. Pressione Escape para fechar.</DialogDescription>
        </DialogHeader>
        <img src={src} alt={alt} className="max-h-[78vh] w-full rounded object-contain" />
      </DialogContent>
    </Dialog>
  );
}