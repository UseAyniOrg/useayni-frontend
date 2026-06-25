import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formService, type FormQuestionPayload } from '@/services/formService';
import { useRolesAndPermissions } from '@/hooks/useRolesAndPermissions';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';

const QUESTION_TYPES = [
  { value: 'text', label: 'Texto aberto' },
  { value: 'long_text', label: 'Texto longo' },
  { value: 'single', label: 'Seleção única' },
  { value: 'multiple', label: 'Seleção múltipla' },
  { value: 'select', label: 'Dropdown' },
  { value: 'scale', label: 'Escala' },
  { value: 'date', label: 'Data' },
  { value: 'yes_no', label: 'Sim / Não' },
];

export default function MiscellaneousFormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rolesAndPermissions, isLoading } = useRolesAndPermissions();
  const [form, setForm] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questionDraft, setQuestionDraft] = useState<FormQuestionPayload>({
    type: 'text',
    title: '',
    required: false,
    options: [{ label: '' }, { label: '' }],
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await formService.getForm(id);
        setForm(data);
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const questions = useMemo(() => form?.questions ?? [], [form]);

  const addQuestion = async () => {
    if (!id || !questionDraft.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...questionDraft,
        title: questionDraft.title.trim(),
        description: questionDraft.description?.trim() || undefined,
        options: questionDraft.options?.filter((o) => o.label.trim()),
      };
      const created = await formService.addQuestion(id, payload);
      setForm((prev: any) => ({ ...prev, questions: [...(prev?.questions ?? []), created] }));
      setQuestionDraft({ type: 'text', title: '', required: false, options: [{ label: '' }, { label: '' }] });
    } finally {
      setSaving(false);
    }
  };

  const saveOrder = async () => {
    if (!id || !form?.questions?.length) return;
    await formService.reorderQuestions(id, form.questions.map((q: any) => q.id));
  };

  return (
    <SidebarProvider>
      <AppSidebar rolesAndPermissions={rolesAndPermissions} isLoading={isLoading} />
      <SidebarInset>
        <AppHeader title="Builder de formulário" />
        <main className="flex-1 overflow-auto p-6 space-y-6">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="text-lg font-semibold">Configuração básica</h2>
            <p className="mt-1 text-sm text-muted-foreground">Crie as perguntas e organize o formulário vinculado à misselânea.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título do formulário</Label>
                <Input value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder="Título" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Descreva o objetivo do formulário" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Adicionar pergunta</h3>
                <p className="text-sm text-muted-foreground">Inclua perguntas de diferentes tipos com validação simples.</p>
              </div>
              <Button onClick={addQuestion} disabled={saving || !questionDraft.title.trim()}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={questionDraft.type}
                  onChange={(e) => setQuestionDraft((prev) => ({ ...prev, type: e.target.value as FormQuestionPayload['type'] }))}
                >
                  {QUESTION_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={questionDraft.title} onChange={(e) => setQuestionDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Ex.: Nome completo" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={questionDraft.description ?? ''} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setQuestionDraft((prev) => ({ ...prev, description: e.target.value }))} placeholder="Ajuda contextual" />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" checked={questionDraft.required ?? false} onChange={(e) => setQuestionDraft((prev) => ({ ...prev, required: e.target.checked }))} />
              <Label>Obrigatória</Label>
            </div>

            {['single', 'multiple', 'select'].includes(questionDraft.type) && (
              <div className="space-y-2">
                <Label>Opções</Label>
                {(questionDraft.options ?? []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={option.label} onChange={(e) => {
                      const next = [...(questionDraft.options ?? [])];
                      next[index] = { label: e.target.value };
                      setQuestionDraft((prev) => ({ ...prev, options: next }));
                    }} placeholder={`Opção ${index + 1}`} />
                    <Button variant="outline" size="icon" onClick={() => {
                      const next = (questionDraft.options ?? []).filter((_, i) => i !== index);
                      setQuestionDraft((prev) => ({ ...prev, options: next.length ? next : [{ label: '' }] }));
                    }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setQuestionDraft((prev) => ({ ...prev, options: [...(prev.options ?? []), { label: '' }] }))}>
                  Adicionar opção
                </Button>
              </div>
            )}

            {questionDraft.type === 'scale' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mínimo</Label>
                  <Input type="number" value={questionDraft.scale_min ?? 1} onChange={(e) => setQuestionDraft((prev) => ({ ...prev, scale_min: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Máximo</Label>
                  <Input type="number" value={questionDraft.scale_max ?? 5} onChange={(e) => setQuestionDraft((prev) => ({ ...prev, scale_max: Number(e.target.value) }))} />
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Perguntas cadastradas</h3>
                <p className="text-sm text-muted-foreground">As perguntas ficam ordenadas e podem ser reordenadas ao salvar.</p>
              </div>
              <Button variant="outline" onClick={saveOrder}>Salvar ordem</Button>
            </div>
            <div className="mt-4 space-y-3">
              {loading ? <p className="text-sm text-muted-foreground">Carregando…</p> : questions.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma pergunta ainda.</p> : questions.map((question: any) => (
                <div key={question.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{question.title}</p>
                      <p className="text-xs text-muted-foreground">{QUESTION_TYPES.find((option) => option.value === question.type)?.label}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{question.required ? 'Obrigatória' : 'Opcional'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate(`/miscelaneas/${id}`)}>Voltar à misselânea</Button>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
