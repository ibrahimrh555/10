import { useSyncExternalStore } from "react";

export type PendingAuthState = {
  email: string | null;
  cityId: string | null;
  intent: "signup" | "login" | null;
  requestedAt: number | null;
};

const EMPTY_STATE: PendingAuthState = { email: null, cityId: null, intent: null, requestedAt: null };
let state = EMPTY_STATE;
const listeners = new Set<() => void>();

function emit() { listeners.forEach(listener => listener()); }

export const pendingAuthStore = {
  getState: () => state,
  subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); },
  setPendingAuth(email: string, cityId: string | null, intent: "signup" | "login", requestedAt: number) {
    state = { email: email.trim().toLowerCase(), cityId, intent, requestedAt };
    emit();
  },
  clearPendingAuth() { state = EMPTY_STATE; emit(); },
};

export function usePendingAuth() {
  return useSyncExternalStore(pendingAuthStore.subscribe, pendingAuthStore.getState, pendingAuthStore.getState);
}
