import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { academicService } from '@/services/academicService';
import type { ScopeRule } from '@/services/miscellaneousService';

type RuleType = ScopeRule['type'];

const RULE_TYPES: { value: RuleType; label: string }[] = [
  { value: 'general', label: '🌐 Toda a plataforma' },
  { value: 'cae', label: 'CAE (estado)' },
  { value: 'car', label: 'CAR (cidade/região)' },
  { value: 'city', label: 'Cidade' },
  { value: 'university', label: 'Universidade' },
  { value: 'course', label: 'Curso' },
  { value: 'semester', label: 'Semestre de um curso' },
];

interface RuleEditorProps {
  rule: ScopeRule;
  onChange: (r: ScopeRule) => void;
  onRemove: () => void;
}

function RuleEditor({ rule, onChange, onRemove }: RuleEditorProps) {
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [caes, setCaes] = useState<{ id: string; name: string }[]>([]);
  const [cars, setCars] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (rule.type === 'cae') {
      academicService.getCaeOptions().then((data) => setCaes(data.map((item) => ({ id: item.id, name: item.name })))).catch(() => setCaes([]));
    }
  }, [rule.type]);

  useEffect(() => {
    if (rule.type === 'car') {
      academicService.getCarOptions().then((data) => setCars(data.map((item) => ({ id: item.id, name: item.name })))).catch(() => setCars([]));
    }
  }, [rule.type]);

  useEffect(() => {
    if (rule.type === 'city') {
      academicService.getCities().then((data) => setCities(data.map((item) => ({ id: item.id, name: item.name })))).catch(() => setCities([]));
    }
  }, [rule.type]);

  useEffect(() => {
    if (['university', 'course', 'semester'].includes(rule.type)) {
      academicService.getUniversities().then((data) => setUniversities(data.map((item) => ({ id: item.id, name: item.name })))).catch(() => setUniversities([]));
    }
  }, [rule.type]);

  useEffect(() => {
    if (['course', 'semester'].includes(rule.type) && rule.university_id) {
      academicService.getCoursesByUniversity(rule.university_id).then((data) => setCourses(data.map((item) => ({ id: item.id, name: item.name })))).catch(() => setCourses([]));
    } else if (['course', 'semester'].includes(rule.type) && !rule.university_id) {
      setCourses([]);
    }
  }, [rule.type, rule.university_id]);

  const set = (patch: Partial<ScopeRule>) => onChange({ ...rule, ...patch });

  return (
    <div className="flex flex-wrap items-start gap-2 rounded-lg border bg-muted/30 p-3">
      {/* Rule type */}
      <div className="flex-1 min-w-[160px] space-y-1">
        <Label className="text-xs">Tipo de regra</Label>
        <select
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          value={rule.type}
          onChange={(e) => {
            const nextType = e.target.value as RuleType;
            onChange({
              type: nextType,
              cae_id: nextType === 'cae' ? rule.cae_id : undefined,
              car_id: nextType === 'car' ? rule.car_id : undefined,
              city_id: nextType === 'city' ? rule.city_id : undefined,
              university_id: ['university', 'course', 'semester'].includes(nextType) ? rule.university_id : undefined,
              course_id: ['course', 'semester'].includes(nextType) ? rule.course_id : undefined,
              semester: nextType === 'semester' ? rule.semester : undefined,
            });
          }}
        >
          {RULE_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* CAE */}
      {rule.type === 'cae' && (
        <div className="flex-1 min-w-[180px] space-y-1">
          <Label className="text-xs">CAE</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.cae_id ?? ''}
            onChange={(e) => set({ cae_id: e.target.value || undefined })}
          >
            <option value="">Selecione um CAE</option>
            {caes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      )}

      {/* CAR */}
      {rule.type === 'car' && (
        <div className="flex-1 min-w-[180px] space-y-1">
          <Label className="text-xs">CAR</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.car_id ?? ''}
            onChange={(e) => set({ car_id: e.target.value || undefined })}
          >
            <option value="">Selecione um CAR</option>
            {cars.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      )}

      {/* City */}
      {rule.type === 'city' && (
        <div className="flex-1 min-w-[180px] space-y-1">
          <Label className="text-xs">Cidade</Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.city_id ?? ''}
            onChange={(e) => set({ city_id: e.target.value || undefined })}
          >
            <option value="">Selecione uma cidade</option>
            {cities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
      )}

      {/* University (for university/course/semester) */}
      {['university', 'course', 'semester'].includes(rule.type) && (
        <div className="flex-1 min-w-[160px] space-y-1">
          <Label className="text-xs">Universidade <span className="text-muted-foreground">(opcional)</span></Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.university_id ?? ''}
            onChange={(e) => set({ university_id: e.target.value || undefined, course_id: undefined, semester: undefined })}
          >
            <option value="">Qualquer universidade</option>
            {universities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      )}

      {/* Course (for course/semester) */}
      {['course', 'semester'].includes(rule.type) && (
        <div className="flex-1 min-w-[160px] space-y-1">
          <Label className="text-xs">Curso <span className="text-muted-foreground">(opcional)</span></Label>
          <select
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.course_id ?? ''}
            onChange={(e) => set({ course_id: e.target.value || undefined, semester: undefined })}
          >
            <option value="">Qualquer curso</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Semester */}
      {rule.type === 'semester' && (
        <div className="w-24 space-y-1">
          <Label className="text-xs">Semestre</Label>
          <input
            type="number"
            min={1}
            max={12}
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={rule.semester ?? ''}
            onChange={(e) => set({ semester: Number(e.target.value) || undefined })}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="mt-5 text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface Props {
  rules: ScopeRule[];
  onChange: (rules: ScopeRule[]) => void;
}

export function ScopeRulesBuilder({ rules, onChange }: Props) {
  const add = () => onChange([...rules, { type: 'general' }]);
  const remove = (i: number) => onChange(rules.filter((_, idx) => idx !== i));
  const update = (i: number, r: ScopeRule) => onChange(rules.map((x, idx) => idx === i ? r : x));

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sem regras = visível para todos os membros da plataforma.
        </p>
      )}
      {rules.map((rule, i) => (
        <RuleEditor key={i} rule={rule} onChange={(r) => update(i, r)} onRemove={() => remove(i)} />
      ))}
      {rules.length > 0 && rules.length > 1 && (
        <p className="text-xs text-muted-foreground">
          As regras são combinadas com <strong>OU</strong> — quem satisfizer qualquer uma delas pode ver.
        </p>
      )}
      <Button type="button" variant="outline" size="sm" onClick={add} className="gap-1">
        <Plus className="h-4 w-4" /> Adicionar regra de escopo
      </Button>
    </div>
  );
}
