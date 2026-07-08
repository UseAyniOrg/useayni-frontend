import type { FieldError } from 'react-hook-form';
import { Label } from '../ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string | FieldError;
}

export default function FormField({ id, label, children, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <span className="text-sm text-destructive">
          {typeof error === 'string' ? error : error.message}
        </span>
      )}
    </div>
  );
}
