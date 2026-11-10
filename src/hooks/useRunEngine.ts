import { useCallback, useRef, useState } from 'react';
import type { Verdict } from '../game/beatClock';
import type { Route } from '../game/routeGenerator';
import { createRunState, resolveTap } from '../game/runEngine';
import type { RunEvent, RunState, SessionConfig } from '../game/runEngine';

/**
 * React wrapper around the pure runEngine. The ref mirror is what animation
 * callbacks read, so a completion callback never works off a stale closure;
 * `state` is only for rendering.
 */
export function useRunEngine(
  session: SessionConfig,
  route: Route,
  onEvents: (events: RunEvent[], next: RunState) => void,
) {
  const [state, setState] = useState<RunState>(() => createRunState(session));
  const ref = useRef<RunState>(state);
  const sink = useRef(onEvents);
  sink.current = onEvents;

  const tap = useCallback(
    (verdict: Verdict) => {
      const resolved = resolveTap(ref.current, route, session, verdict);
      ref.current = resolved.state;
      setState(resolved.state);
      if (resolved.events.length > 0) {
        sink.current(resolved.events, resolved.state);
      }
      return resolved;
    },
    [route, session],
  );

  const reset = useCallback(() => {
    const fresh = createRunState(session);
    ref.current = fresh;
    setState(fresh);
  }, [session]);

  return { state, stateRef: ref, tap, reset };
}

export default useRunEngine;
