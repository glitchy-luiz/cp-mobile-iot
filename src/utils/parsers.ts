import { LampState } from '../types/mqtt';

function parseJson(payload: string): Record<string, unknown> | null {
  try {
    const data: unknown = JSON.parse(payload);
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return data as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Aceita {"value": 24.5}. Retorna null se inválido. */
export function parseSensorValue(payload: string): number | null {
  const data = parseJson(payload);
  if (!data) return null;
  const value = data.value;
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Aceita {"state": "ON" | "OFF"}. Retorna null se inválido. */
export function parseLampState(payload: string): LampState | null {
  const data = parseJson(payload);
  if (!data) return null;
  const state = data.state;
  return state === 'ON' || state === 'OFF' ? state : null;
}
