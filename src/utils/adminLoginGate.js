const GATE_TTL_MS = 5 * 60 * 1000;

let unlockedUntil = 0;

export const ADMIN_LOGIN_GATE_STATE = Object.freeze({ adminGate: true });

export function unlockAdminLoginGate() {
  unlockedUntil = Date.now() + GATE_TTL_MS;
}

export function clearAdminLoginGate() {
  unlockedUntil = 0;
}

export function hasAdminLoginGate(routerState) {
  return Boolean(unlockedUntil > Date.now() || routerState?.adminGate === true);
}
