import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";

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

interface SponsorOptionResponse {
  id: string;
  name: string;
  slug?: string | null;
  profile_picture_url?: string | null;
  course?: {
    name: string;
  };
  university?: {
    name: string;
  };
}

const mapSponsorOption = (member: SponsorOptionResponse): Member => ({
  id: member.id,
  name: member.name,
  slug: member.slug || "",
  course: member.course?.name || "",
  university: member.university?.name || "",
  avatar: member.profile_picture_url || undefined,
});

const getSponsorOptions = async (): Promise<Member[]> => {
  const response = await api.get<SponsorOptionResponse[]>("/members/sponsors/options");
  return response.data.map(mapSponsorOption);
};

export const findMemberBySlug = async (slug: string): Promise<Member | null> => {
  const members = await getSponsorOptions();
  return members.find(member => member.slug === slug) || null;
};

export const findMemberById = async (id: string): Promise<Member | null> => {
  const members = await getSponsorOptions();
  return members.find(member => member.id === id) || null;
};

const ITEMS_PER_PAGE = 5;

export function PadrinhoSelector({
  selectedPadrinho,
  onSelect,
}: PadrinhoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMembers = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const sponsorOptions = await getSponsorOptions();
        if (isMounted) setMembers(sponsorOptions);
      } catch {
        if (isMounted) setLoadError("Nao foi possivel carregar os padrinhos.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMembers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMembers = members.filter((member) =>
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
          type="button"
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
          type="button"
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
        <Button type="button" variant="outline" className="w-full justify-start gap-2">
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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Carregando...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && loadError && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-destructive">
                      {loadError}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !loadError && paginatedMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Nenhum padrinho encontrado
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !loadError && paginatedMembers.map((member) => (
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
                            {[member.course, member.university].filter(Boolean).join(" - ")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="truncate">{member.course || "-"}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="truncate">{member.university || "-"}</div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
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
                Pagina {currentPage} de {totalPages} ({filteredMembers.length} membros)
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
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
