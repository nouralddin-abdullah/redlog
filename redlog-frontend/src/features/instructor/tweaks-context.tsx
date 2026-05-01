import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Tweaks let a reviewer audit instructor pages against different data shapes
 * without editing fixtures. They live in React state (no URL persistence) so
 * a tweak doesn't bleed into a refreshed link — each session starts default.
 *
 * If you add a tweak: extend `TweaksState`, give it a default in `defaults`,
 * and surface a control in `<TweaksPanel>`.
 */

export interface TweaksState {
  /** Force the courses list to render its empty state. */
  emptyCourses: boolean;
  /** Force students list empty. */
  emptyStudents: boolean;
  /** Hide all activity (enrollments, reviews, questions). */
  emptyActivity: boolean;
  /** Treat the instructor as having $0 lifetime earnings. */
  zeroEarnings: boolean;
  /** When true, the dashboard hides money fields entirely. */
  hideMoney: boolean;
  /** Filter the courses list by status. `all` = no filter. */
  courseStatusFilter:
    | 'all'
    | 'published'
    | 'draft'
    | 'pending_review'
    | 'rejected';
}

const defaults: TweaksState = {
  emptyCourses: false,
  emptyStudents: false,
  emptyActivity: false,
  zeroEarnings: false,
  hideMoney: false,
  courseStatusFilter: 'all',
};

interface TweaksContextValue {
  tweaks: TweaksState;
  setTweak: <K extends keyof TweaksState>(key: K, value: TweaksState[K]) => void;
  reset: () => void;
}

const TweaksContext = createContext<TweaksContextValue | null>(null);

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [tweaks, setTweaks] = useState<TweaksState>(defaults);

  const setTweak = useCallback(
    <K extends keyof TweaksState>(key: K, value: TweaksState[K]) => {
      setTweaks((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setTweaks(defaults), []);

  const value = useMemo(
    () => ({ tweaks, setTweak, reset }),
    [tweaks, setTweak, reset],
  );

  return <TweaksContext.Provider value={value}>{children}</TweaksContext.Provider>;
}

export function useTweaks(): TweaksContextValue {
  const ctx = useContext(TweaksContext);
  if (!ctx) {
    throw new Error('useTweaks must be used within <TweaksProvider>');
  }
  return ctx;
}
