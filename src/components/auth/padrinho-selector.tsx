import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export interface Member {
  id: string;
  name: string;
  slug: string;
  course: string;
  university: string;
  avatar?: string;
}

interface PadrinhoSelectorProps {
  selectedPadrinho: Member | null;
  onSelect: (member: Member | null) => void;
}

const mockMembers: Member[] = [
  { id: "1", name: "João Silva", slug: "joao-silva", course: "Ciência da Computação", university: "UNIFESP" },
  { id: "2", name: "Maria Santos", slug: "maria-santos", course: "Engenharia de Software", university: "USP" },
  { id: "3", name: "Pedro Costa", slug: "pedro-costa", course: "Sistemas de Informação", university: "UNESP" },
  { id: "4", name: "Ana Oliveira", slug: "ana-oliveira", course: "Análise e Desenvolvimento", university: "PUC-SP" },
  { id: "5", name: "Carlos Ferreira", slug: "carlos-ferreira", course: "Ciência da Computação", university: "UNIFESP" },
  { id: "6", name: "Lucia Mendes", slug: "lucia-mendes", course: "Engenharia de Software", university: "USP" },
  { id: "7", name: "Roberto Lima", slug: "roberto-lima", course: "Sistemas de Informação", university: "UNESP" },
  { id: "8", name: "Fernanda Rocha", slug: "fernanda-rocha", course: "Análise e Desenvolvimento", university: "PUC-SP" },
  { id: "9", name: "Leonardo Paniz Aguiar", slug: "leonardo-paniz-aguiar", course: "Ciência da Computação", university: "UNIFESP" },
];

export const findMemberBySlug = (slug: string): Member | null => {
  return mockMembers.find(member => member.slug === slug) || null;
};

const ITEMS_PER_PAGE = 5;

export function PadrinhoSelector({
  selectedPadrinho,
  onSelect,
}: PadrinhoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = mockMembers.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSelect = (member: Member) => {
    onSelect(member);
    setIsOpen(false);
    setSearch("");
    setCurrentPage(1);
  };

  const handleRemove = () => {
    onSelect(null);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  if (selectedPadrinho) {
    return (
      <div className="flex gap-0">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2 rounded-r-none">
          <Avatar className="w-6 h-6">
            <AvatarImage src={selectedPadrinho.avatar} />
            <AvatarFallback className="text-xs">
              {selectedPadrinho.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{selectedPadrinho.name}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRemove}
          className="rounded-l-none border-l-0">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <UserPlus className="w-4 h-4" />
          Escolher padrinho
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[1200px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Escolher Padrinho</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4 flex-1 min-h-0">
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <div className="flex-1 overflow-auto border rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[40%]">Membro</TableHead>
                  <TableHead className="w-[30%] hidden sm:table-cell">
                    Curso
                  </TableHead>
                  <TableHead className="w-[20%] hidden md:table-cell">
                    Faculdade
                  </TableHead>
                  <TableHead className="w-[10%]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {member.name}
                          </div>
                          <div className="text-sm text-muted-foreground sm:hidden">
                            {member.course} - {member.university}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="truncate">{member.course}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="truncate">{member.university}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleSelect(member)}
                        className="w-full sm:w-auto">
                        Selecionar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({filteredMembers.length}{" "}
                membros)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
