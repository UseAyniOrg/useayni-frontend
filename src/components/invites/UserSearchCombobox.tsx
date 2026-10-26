import { useEffect, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { memberSearchService, type MemberSearchMode } from '@/services/memberSearchService';
import type { MemberSearchResult } from '@/types/invite';
import { cn } from '@/lib/utils';

interface UserSearchComboboxProps {
  selectedUser: MemberSearchResult | null;
  onSelect: (user: MemberSearchResult | null) => void;
  disabled?: boolean;
}

export function UserSearchCombobox({
  selectedUser,
  onSelect,
  disabled = false,
}: UserSearchComboboxProps) {
  const [searchMode, setSearchMode] = useState<MemberSearchMode>('name');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!query.trim() || selectedUser) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const members = await memberSearchService.searchMembers(query, searchMode);
        setResults(members);
        setIsOpen(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, searchMode, selectedUser]);

  const handleSelect = (user: MemberSearchResult) => {
    onSelect(user);
    setQuery(user.name);
    setResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery('');
    setResults([]);
  };

  const initials = (name: string) =>
    name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-3">
      <Tabs
        value={searchMode}
        onValueChange={(value: string) => {
          setSearchMode(value as MemberSearchMode);
          handleClear();
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="name" className="flex-1" disabled={disabled}>
            Nome
          </TabsTrigger>
          <TabsTrigger value="email" className="flex-1" disabled={disabled}>
            E-mail
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="user-search">
          Buscar por {searchMode === 'name' ? 'nome' : 'e-mail'}
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="user-search"
            type={searchMode === 'email' ? 'email' : 'text'}
            placeholder={
              searchMode === 'name' ? 'Digite o nome do usuário' : 'Digite o e-mail do usuário'
            }
            value={selectedUser ? selectedUser.name : query}
            onChange={e => {
              if (selectedUser) handleClear();
              setQuery(e.target.value);
            }}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="pl-9"
            disabled={disabled}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
            <AvatarFallback>{initials(selectedUser.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedUser.name}</p>
            {selectedUser.email && (
              <p className="truncate text-xs text-muted-foreground">{selectedUser.email}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-primary hover:underline"
            disabled={disabled}
          >
            Alterar
          </button>
        </div>
      )}

      {isOpen && results.length > 0 && !selectedUser && (
        <ul className="max-h-48 overflow-y-auto rounded-md border bg-popover shadow-md">
          {results.map(user => (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => handleSelect(user)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  {user.email && (
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim() && !isSearching && results.length === 0 && !selectedUser && (
        <p className="text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
      )}
    </div>
  );
}
