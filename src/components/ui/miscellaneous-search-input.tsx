import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2, X } from 'lucide-react';
import { miscellaneousService, type Miscellaneous } from '@/services/miscellaneousService';

interface Props {
  value?: Miscellaneous;
  onChange: (item: Miscellaneous | undefined) => void;
  placeholder?: string;
}

export function MiscellaneousSearchInput({ value, onChange, placeholder = 'Buscar miscelânea…' }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Miscellaneous[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await miscellaneousService.list({ search: query, limit: 8 });
        setResults(res.data);
        setOpen(true);
      } finally { setLoading(false); }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{value.title}</p>
          <p className="text-xs text-muted-foreground capitalize">{value.type}</p>
        </div>
        <button type="button" onClick={() => onChange(undefined)} className="text-muted-foreground hover:text-foreground shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
      <Input
        className="pl-8"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg max-h-52 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
              onMouseDown={() => { onChange(item); setQuery(''); setOpen(false); }}
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
