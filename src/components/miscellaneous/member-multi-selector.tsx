import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { listMembers, type MemberOption } from '@/services/memberService';

interface MemberMultiSelectorProps {
  selected: MemberOption[];
  onChange: (members: MemberOption[]) => void;
  triggerText?: string;
  /** IDs que não podem ser selecionados (ex.: o próprio criador). */
  excludeIds?: string[];
}

const ITEMS_PER_PAGE = 5;

const initials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export function MemberMultiSelector({
  selected,
  onChange,
  triggerText = 'Adicionar membros',
  excludeIds = [],
}: MemberMultiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await listMembers();
        if (isMounted) setMembers(data);
      } catch {
        if (isMounted) setLoadError('Não foi possível carregar os membros.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const selectableMembers = useMemo(
    () => members.filter(m => !excludeIds.includes(m.id)),
    [members, excludeIds],
  );

  const filteredMembers = useMemo(
    () =>
      selectableMembers.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [selectableMembers, search],
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const isSelected = (id: string) => selected.some(m => m.id === id);

  const toggle = (member: MemberOption) => {
    if (isSelected(member.id)) {
      onChange(selected.filter(m => m.id !== member.id));
    } else {
      onChange([...selected, member]);
    }
  };

  const remove = (id: string) => onChange(selected.filter(m => m.id !== id));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(member => (
            <span
              key={member.id}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted/50 py-1 pl-1 pr-2 text-sm">
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-[10px]">
                  {initials(member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[160px] truncate">{member.name}</span>
              <button
                type="button"
                onClick={() => remove(member.id)}
                className="text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start gap-2">
            <UserPlus className="h-4 w-4" />
            {triggerText}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[90vw] lg:max-w-[900px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Selecionar membros</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4 flex-1 min-h-0">
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
            />
            <div className="flex-1 overflow-auto border rounded-md">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead className="w-[120px] text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && loadError && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-sm text-destructive">
                        {loadError}
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !loadError && paginatedMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                        Nenhum membro encontrado
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    !loadError &&
                    paginatedMembers.map(member => {
                      const active = isSelected(member.id);
                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="text-xs">
                                  {initials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="min-w-0 truncate font-medium">
                                {member.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant={active ? 'secondary' : 'default'}
                              onClick={() => toggle(member)}>
                              {active ? (
                                <>
                                  <Check className="h-4 w-4" /> Selecionado
                                </>
                              ) : (
                                'Adicionar'
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages} ({filteredMembers.length} membros)
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button type="button" onClick={() => setIsOpen(false)}>
                Concluir ({selected.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
