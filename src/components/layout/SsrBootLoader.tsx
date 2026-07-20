"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * Renders only in the server HTML / pre-hydration paint.
 * Hides as soon as the client hydrates — no timer, no SPA re-trigger.
 */
export function SsrBootLoader() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);

  if (hydrated) return null;

  return (
    <div className="ssr-boot" aria-busy="true" aria-live="polite">
      <div className="ssr-boot__glow" aria-hidden />
      <div className="ssr-boot__inner">
        <div className="ssr-boot__orbits" aria-hidden>
          <span className="ssr-boot__ring ssr-boot__ring--a" />
          <span className="ssr-boot__ring ssr-boot__ring--b" />
          <span className="ssr-boot__dot" />
        </div>
        <p className="ssr-boot__brand">AxenFlowAI</p>
        <p className="ssr-boot__hint">Preparing…</p>
        <div className="ssr-boot__bar" aria-hidden>
          <span className="ssr-boot__bar-fill" />
        </div>
      </div>
    </div>
  );
}
