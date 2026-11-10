import { useCallback } from 'react';
import type { Profile, Settings } from '../game/storage';

/**
 * Thin selector over the profile: a screen that only cares about one option
 * pulls that option instead of subscribing to the whole profile object.
 * The BPM side of ROUTE PACE lives in src/game/sessions.ts, next to the
 * session builders that use it.
 */
export function useSettings(
  profile: Profile,
  update: (patch: Partial<Profile>) => void,
) {
  const settings = profile.settings;

  const setOption = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      update({ settings: { ...profile.settings, [key]: value } });
    },
    [profile.settings, update],
  );

  return { settings, setOption };
}

export default useSettings;
