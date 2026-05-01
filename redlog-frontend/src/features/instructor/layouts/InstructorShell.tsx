import { Outlet } from 'react-router-dom';

import { InstructorSidebar } from '@/features/instructor/components/InstructorSidebar';
import { InstructorTopbar } from '@/features/instructor/components/InstructorTopbar';
import { TweaksPanel } from '@/features/instructor/components/TweaksPanel';
import { TweaksProvider } from '@/features/instructor/tweaks-context';

/**
 * Standalone shell for the /instructor area. Mirrors the learner AppShell
 * structure (sidebar + topbar + main outlet) but uses the instructor-specific
 * sidebar / topbar so the two surfaces are visibly distinct from the first
 * pixel. The TweaksProvider wraps the outlet so any page can read tweaks
 * via the `useTweaks()` hook.
 */
export function InstructorShell() {
  return (
    <TweaksProvider>
      <div className="flex min-h-screen bg-[var(--color-surface-soft)]">
        <InstructorSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <InstructorTopbar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <TweaksPanel />
      </div>
    </TweaksProvider>
  );
}
