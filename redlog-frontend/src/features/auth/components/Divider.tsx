export function Divider({ label }: { label: string }) {
  return (
    <div className="my-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[12px] text-[var(--color-ink-400)]">
      <div className="h-px bg-[var(--color-line)]" />
      <span className="px-1">{label}</span>
      <div className="h-px bg-[var(--color-line)]" />
    </div>
  );
}
