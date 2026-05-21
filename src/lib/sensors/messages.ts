import type { MoistureZone, PetuciaMessage, SensorReading } from "./types";

/** Valores altos no analógico = solo mais seco (padrão dos sensores resistivos). */
const DRY_THRESHOLD = 800;
const WARNING_THRESHOLD = 500;

const THIRSTY_AFTER_MS = 60_000;
const WARNING_AFTER_MS = 30_000;

export function soilMoistureToZone(value: number): MoistureZone {
  if (value >= DRY_THRESHOLD) return "thirsty";
  if (value >= WARNING_THRESHOLD) return "warning";
  return "comfortable";
}

export function getMessageForZone(
  zone: MoistureZone,
  zoneDurationMs: number,
): PetuciaMessage {
  if (zone === "thirsty" && zoneDurationMs >= THIRSTY_AFTER_MS) {
    return "Estou com sede";
  }
  if (zone === "warning" && zoneDurationMs >= WARNING_AFTER_MS) {
    return "Estou bem, mas estou ficando com sede";
  }
  if (zone === "thirsty" && zoneDurationMs < THIRSTY_AFTER_MS) {
    return "Estou bem, mas estou ficando com sede";
  }
  if (zone === "comfortable") {
    return "Estou bem tranquila";
  }
  return "Estou bem tranquila";
}

export function buildStatus(
  connected: boolean,
  reading: SensorReading | null,
  zone: MoistureZone | null,
  zoneEnteredAt: number | null,
): {
  message: PetuciaMessage;
  zone: MoistureZone | null;
  zoneDurationMs: number;
} {
  if (!connected || !reading || zone === null || zoneEnteredAt === null) {
    return {
      message: "Aguardando leituras do Arduino...",
      zone: null,
      zoneDurationMs: 0,
    };
  }

  const zoneDurationMs = Date.now() - zoneEnteredAt;

  return {
    message: getMessageForZone(zone, zoneDurationMs),
    zone,
    zoneDurationMs,
  };
}
