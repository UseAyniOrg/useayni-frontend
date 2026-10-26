import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { withTenantQuery } from '@/lib/auth/accessContext';
import { DataTable } from '@/components/ui/data-table';

interface Registration {
  id: string; title: string; start_date: string; status: string;
  public_slug: string | null; public_access_enabled: boolean;
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    api.get<Registration[]>('/external-profile/registrations').then(({ data }) => setEvents(data))
      .catch(() => setError('Não foi possível carregar seus eventos. Tente novamente mais tarde.'))
      .finally(() => setLoading(false));
  }, []);
  return <main className="min-h-screen bg-muted/20 px-6 py-12">
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-3">
        <Link className="text-sm text-primary underline" to="/">Página da organização</Link>
        <h1 className="text-3xl font-bold">Meus eventos</h1>
        <p className="text-muted-foreground">Acesse os eventos em que você se inscreveu, consulte as informações e apresente seu código de presença à equipe.</p>
      </header>
      {loading && <p>Carregando eventos...</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}
      {!loading && !error && events.length === 0 && <p>Você ainda não tem inscrições nesta organização. Acesse o link público de um evento para participar.</p>}
      {!loading && !error && <DataTable rows={events} label="meus eventos" search={event => `${event.title} ${event.status}`}
        columns={[
          { key: 'title', header: 'Evento', cell: event => event.title },
          { key: 'date', header: 'Data', cell: event => new Date(event.start_date).toLocaleString('pt-BR') },
          { key: 'status', header: 'Inscrição', cell: event => `Confirmada${event.status === 'archived' ? ' · Evento arquivado' : ''}` },
          { key: 'actions', header: 'Acesso', cell: event => <Link className="inline-flex items-center gap-2 text-primary underline"
            to={withTenantQuery(event.status === 'active' && event.public_access_enabled && event.public_slug ? `/eventos/${event.public_slug}` : `/miscelaneas/${event.id}`)}>
            Acessar evento <ArrowRight className="size-4 shrink-0" /></Link> },
        ]} />}
    </div>
  </main>;
}
