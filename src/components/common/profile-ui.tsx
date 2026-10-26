import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ProfileSectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  footer?: ReactNode;
}

export function ProfileSectionCard({
  title,
  children,
  className,
  action,
  footer,
}: ProfileSectionCardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl bg-white p-6 shadow-[0_3px_3px_rgba(0,0,0,0.25)]',
        className
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-black">{title}</h2>
        {action}
      </div>
      {children}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}

interface SkillChipProps {
  label: string;
}

export function SkillChip({ label }: SkillChipProps) {
  return (
    <span className="inline-flex items-center rounded-xl bg-[#bee2ff] px-3 py-1 text-sm font-medium text-[#004e90]">
      {label}
    </span>
  );
}

interface ProfileBadgeProps {
  label: string;
  icon?: ReactNode;
}

export function ProfileBadge({ label, icon }: ProfileBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#e1e8fd] px-2.5 py-1 text-sm font-medium text-black">
      {icon}
      {label}
    </span>
  );
}

interface ProfileLinkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ProfileLinkButton({ children, onClick, className }: ProfileLinkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-sm font-semibold text-[#004e90] transition-colors hover:text-[#004e90]/80',
        className
      )}
    >
      {children}
    </button>
  );
}

interface ProfileActionPillProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function ProfileActionPill({ label, icon, onClick }: ProfileActionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-[#e1e8fd] px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-[#d4dcfb]"
    >
      {icon}
      {label}
    </button>
  );
}
