import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  loadProfile,
  resetProfile,
  saveProfile,
} from '../game/storage';
import type { Profile } from '../game/storage';

/**
 * The single owner of the saved profile. Screens never touch storage.ts
 * directly: they read `profile` and call `update`, so there is exactly one
 * write path and one source of truth.
 */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => ({
    ...DEFAULT_PROFILE,
    settings: { ...DEFAULT_SETTINGS },
  }));
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    loadProfile().then(p => {
      if (alive.current) {
        setProfile(p);
      }
    });
    return () => {
      alive.current = false;
    };
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    saveProfile(patch).then(p => {
      if (alive.current) {
        setProfile(p);
      }
    });
  }, []);

  const reset = useCallback(() => {
    resetProfile().then(p => {
      if (alive.current) {
        setProfile(p);
      }
    });
  }, []);

  return { profile, update, reset };
}

export default useProfile;
