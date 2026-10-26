import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { X, Search, Loader2 } from 'lucide-react';
import { memberService, type MemberSearchResult } from '@/services/memberService';

interface Props {
  selected: MemberSearchResult[];
  onAdd: (member: MemberSearchResult) => void;
  onRemove: (id: string) => void;
  placeholder?: string;
  max?: number;
}

export function MemberSearchInput({ selected, onAdd, onRemove, placeholder = 'Buscar membro…', max }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try { setResults(await memberService.search(query)); setOpen(true); }
      finally { setLoading(false); }
    }, 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  const selectedIds = new Set(selected.map((m) => m.id));
  const filtered = results.filter((r) => !selectedIds.has(r.id));

  const pick = (member: MemberSearchResult) => {
    onAdd(member);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const reachedMax = max !== undefined && selected.length >= max;

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((m) => (
            <span key={m.id} className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {m.name}
              <button type="button" onClick={() => onRemove(m.id)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {!reachedMax && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          {loading && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          <Input
            className="pl-8"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onFocus={() => filtered.length > 0 && setOpen(true)}
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg max-h-52 overflow-y-auto">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                  onMouseDown={() => pick(m)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
