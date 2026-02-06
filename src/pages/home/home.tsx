import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Users,
  Target,
  Calendar,
  Award,
  CheckSquare,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const cargos = [
  "Estudante",
  "Membros Creajr",
  "Centros acadêmicos",
  "Professores",
  "Empresas Juniors",
  "Entidades de classe",
  "Empresas Parceiras",
  "Equipe técnica",
];

const mockComunidades = ["Comunidade A", "Comunidade B", "Comunidade C"];

export default function Home() {
  const [cargoAtivo, setCargoAtivo] = useState("Estudante");
  const [comunidadesOpen, setComunidadesOpen] = useState(false);
  const [tarefasOpen, setTarefasOpen] = useState(false);

  const user = {
    name: "João Silva",
    email: "joao@email.com",
    avatar: "",
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 p-4">
            <img src="/Ayni.svg" alt="Ayni" className="h-8 w-auto" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">
                  {user.name.split(" ")[0]}
                </p>
                <Select value={cargoAtivo} onValueChange={setCargoAtivo}>
                  <SelectTrigger className="h-6 w-6 p-0 border-0">
                    <ChevronDown className="h-4 w-4" />
                  </SelectTrigger>
                  <SelectContent>
                    {cargos.map((cargo) => (
                      <SelectItem key={cargo} value={cargo}>
                        {cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">{cargoAtivo}</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Chats">
                    <MessageSquare className="h-4 w-4" />
                    <span>Chats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible
                  open={comunidadesOpen}
                  onOpenChange={setComunidadesOpen}
                  asChild
                  className="group/collapsible">
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Comunidades" asChild>
                      <CollapsibleTrigger>
                        <Users className="h-4 w-4" />
                        <span>Comunidades</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-100 group-data-open/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {mockComunidades.map((comunidade) => (
                          <SidebarMenuSubItem key={comunidade}>
                            <SidebarMenuSubButton>
                              <span>{comunidade}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span>Explorar</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Metas">
                    <Target className="h-4 w-4" />
                    <span>Metas</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Agenda">
                    <Calendar className="h-4 w-4" />
                    <span>Agenda</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Participações">
                    <Award className="h-4 w-4" />
                    <span>Participações</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible
                  open={tarefasOpen}
                  onOpenChange={setTarefasOpen}
                  asChild
                  className="group/collapsible">
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Tarefas" asChild>
                      <CollapsibleTrigger>
                        <CheckSquare className="h-4 w-4" />
                        <span>Tarefas</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-100 group-data-open/collapsible:rotate-90" />
                      </CollapsibleTrigger>
                    </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span>Vinculadas</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton>
                            <span>Explorar</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Configurações">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-3 p-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{user.name.split(" ")[0]}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-xl font-semibold">Home</h1>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Ayni</h2>
              <p className="text-muted-foreground">
                Sua plataforma de colaboração e crescimento acadêmico.
              </p>
            </div>

            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Comunidades Ativas</h3>
                <p className="text-sm text-muted-foreground">
                  Participe de discussões e colabore com outros estudantes.
                </p>
              </div>

              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Suas Metas</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe seu progresso e conquiste seus objetivos.
                </p>
              </div>

              <div className="aspect-video rounded-xl bg-muted/50 p-6">
                <h3 className="font-semibold mb-2">Próximos Eventos</h3>
                <p className="text-sm text-muted-foreground">
                  Não perca nenhum evento importante da sua agenda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
