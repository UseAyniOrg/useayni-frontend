import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { miscellaneousService } from '@/services/miscellaneousService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BasicInfoStep } from '@/components/miscellaneous/steps/BasicInfoStep';
import { Label } from '@/components/ui/label';
import type { Miscellaneous } from '@/services/miscellaneousService';

export default function MiscellaneousEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading: rolesLoading } = useRolesAndPermissions();

  const [misc, setMisc] = useState<Miscellaneous | null>(null);
  const [fields, setFields] = useState<Record<string, string | number | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    miscellaneousService.getById(id).then((m) => {
      setMisc(m);
      setFields({
        title: m.title,
        description: m.description,
        start_date: m.start_date?.slice(0, 16),
        end_date: m.end_date?.slice(0, 16),
        stream_link: m.stream_link,
        capacity_presential: m.capacity_presential,
        capacity_online: m.capacity_online,
        meeting_link: m.meeting_link,
        agenda: m.agenda,
        goal_target: m.goal_target,
        goal_unit: m.goal_unit,
        goal_progress: m.goal_progress,
        activity_status: m.activity_status,
        activity_priority: m.activity_priority,
        location_zip: (m as any).location_zip,
        location_street: (m as any).location_street,
        location_number: (m as any).location_number,
        location_neighborhood: (m as any).location_neighborhood,
        location_city: (m as any).location_city,
        location_state: (m as any).location_state,
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const setField = (name: string, value: string | number | undefined) =>
    setFields((prev) => ({ ...prev, [name]: value }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await miscellaneousService.update(id, fields);
      navigate(`/miscelaneas/${id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !misc) return null;

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={rolesLoading} />
      <SidebarInset>
        <AppHeader title={`Editar: ${misc.title}`} />
        <main className="flex-1 overflow-auto p-6 max-w-2xl mx-auto space-y-6">
          {/* Type locked */}
          <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
            <Label className="text-muted-foreground text-sm">Tipo (imutável):</Label>
            <span className="text-sm font-medium capitalize">{misc.type}</span>
          </div>

          <BasicInfoStep type={misc.type} values={fields} onChange={setField} />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate(`/miscelaneas/${id}`)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
