import { useEffect, useState } from 'react';
import { organizationService, type HierarchyTemplate } from '@/services/organizationService';
import { Button } from '@/components/ui/button';
import axios from 'axios';

export default function HierarchyTemplates({ organizationId }: { organizationId: string }) {
  const [templates, setTemplates] = useState<HierarchyTemplate[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    organizationService.getHierarchyTemplates().then((data) => {
      if (active) setTemplates(data);
    }).catch(() => {
      if (active) setError('Não foi possível carregar a biblioteca de hierarquias.');
    });
    return () => { active = false; };
  }, []);

  const importTemplate = async () => {
    setError('');
    setResult('');
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setError('O arquivo não é um JSON válido. Corrija o conteúdo antes de importar.');
      return;
    }
    setSaving(true);
    try {
      const response = await organizationService.importHierarchy(organizationId, parsed);
      setResult(`Importação concluída: ${response.types} tipos, ${response.units} unidades e ${response.positions} cargos. Ative o módulo Hierarquia para disponibilizá-lo aos administradores.`);
      setDraft('');
    } catch (cause: unknown) {
      const message = axios.isAxiosError<{ message?: string }>(cause) ? cause.response?.data.message : undefined;
      setError(message ?? 'Não foi possível importar a hierarquia.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <details className="space-y-3 border-t pt-4">
      <summary className="cursor-pointer font-medium">Biblioteca e importação de hierarquias</summary>
      <p className="text-sm text-muted-foreground">
        Selecione um padrão, edite o JSON ou baixe o modelo para adaptar e enviar depois.
        A importação adiciona tipos, unidades e cargos; não cria membros nem atribui mandatos.
        Slugs repetidos são recusados, sem substituir dados existentes. Os exemplos não substituem o estatuto da entidade.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.slug} className="space-y-2 rounded-md border p-3 text-sm">
            <h4 className="font-medium">{template.name}</h4>
            <p>{template.organization_profile}</p>
            <p className="text-muted-foreground">{template.description}</p>
            <p>{template.types.length} tipos · {template.units.length} unidades · {template.positions.length} cargos</p>
            <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => {
              setDraft(JSON.stringify(template, null, 2));
              setError('');
              setResult('');
            }}>Selecionar e personalizar</Button>
            <a className="block text-primary underline" download={`ayni-${template.slug}.json`}
              href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(template, null, 2))}`}>
              Baixar modelo JSON
            </a>
          </article>
        ))}
      </div>
      <label className="grid gap-2 text-sm">
        <span>Enviar hierarquia personalizada (.json, até 90 KiB)</span>
        <input type="file" accept=".json,application/json" disabled={saving} onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) return;
          setError('');
          setResult('');
          if (file.size > 90 * 1024) {
            setError('O modelo deve ter no máximo 90 KiB.');
            return;
          }
          try {
            setDraft(await file.text());
          } catch {
            setError('Não foi possível ler o arquivo.');
          }
        }} />
      </label>
      {draft && (
        <div className="space-y-2">
          <label className="grid gap-2 text-sm">
            <span>Revise tipos, referências por slug, cargos e duração dos mandatos antes de confirmar</span>
            <textarea className="min-h-72 rounded-md border bg-background p-3 font-mono text-xs"
              value={draft} onChange={(event) => setDraft(event.target.value)} disabled={saving} />
          </label>
          <Button type="button" disabled={saving} onClick={() => void importTemplate()}>
            {saving ? 'Importando...' : 'Confirmar e criar hierarquia'}
          </Button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {result && <p role="status" className="text-sm">{result}</p>}
    </details>
  );
}
