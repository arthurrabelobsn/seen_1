"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "seen:storage";
// Reserva em memória quando o navegador bloqueia o armazenamento
const memory = new Map<string, string>();

function read(key: string) {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

/**
 * Preferência guardada no navegador (ex.: painel aberto/fechado).
 * Sobrevive a recarregar a página e não causa diferença entre servidor e navegador.
 */
export function usePersistentState<T>(key: string, fallback: T): [T, (v: T) => void] {
  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    window.addEventListener(EVENT, cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener(EVENT, cb);
    };
  }, []);

  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  let value = fallback;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }

  const set = useCallback(
    (v: T) => {
      memory.set(key, JSON.stringify(v));
      try {
        window.localStorage.setItem(key, JSON.stringify(v));
      } catch {
        // navegação privada ou armazenamento bloqueado: só não lembra
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [value, set];
}
