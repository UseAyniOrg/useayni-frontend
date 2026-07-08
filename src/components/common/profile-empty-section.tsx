import { ProfileSectionCard } from "./profile-ui";

interface ProfileEmptySectionProps {
  title: string;
  message: string;
  className?: string;
}

export function ProfileEmptySection({ title, message, className }: ProfileEmptySectionProps) {
  return (
    <ProfileSectionCard title={title} className={className}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </ProfileSectionCard>
  );
}

export function hasProfileSectionData<T>(items: T[] | undefined | null): items is T[] {
  return Array.isArray(items) && items.length > 0;
}
