import { Label } from "../ui/label";

interface FormFieldProps {
    id: string,
    label: string,
    children: React.ReactNode,
}

export default function FormField({ id, label, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
    </div>
  )
}
