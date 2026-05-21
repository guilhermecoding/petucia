import type { MoistureZone, PetuciaMessage, SensorReading } from "./types";

/** Valores altos no analógico = solo mais seco. */
const WELL_BELOW = 600;
const THIRSTY_ABOVE = 900;

/** Abaixo disso a umidade exibida fica em 100%. */
export const SOIL_MOISTURE_FULL = 600;
/** Leitura bruta em que a umidade exibida é 0%. */
export const SOIL_MOISTURE_DRY = 1000;

export function soilMoistureToPercent(raw: number): number {
  if (raw <= SOIL_MOISTURE_FULL) return 100;
  if (raw >= SOIL_MOISTURE_DRY) return 0;
  const percent = 100 - ((raw - SOIL_MOISTURE_FULL) / (SOIL_MOISTURE_DRY - SOIL_MOISTURE_FULL)) * 100;
  return Math.round(percent);
}

export function soilMoistureToZone(value: number): MoistureZone {
  if (value > THIRSTY_ABOVE) return "thirsty";
  if (value >= WELL_BELOW) return "warning";
  return "comfortable";
}

export function getMessageForZone(zone: MoistureZone): PetuciaMessage {
  if (zone === "thirsty") return "Estou com sede 🥵";
  if (zone === "warning") return "Estou bem, mas estou ficando com sede 😕";
  return "Estou bem tranquila 😌";
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
  if (!reading) {
    return {
      message: connected
        ? "Conectada! Aguardando primeira leitura..."
        : "Aguardando leituras do Arduino...",
      zone: null,
      zoneDurationMs: 0,
    };
  }

  if (zone === null || zoneEnteredAt === null) {
    return {
      message: "Aguardando leituras do Arduino...",
      zone: null,
      zoneDurationMs: 0,
    };
  }

  const zoneDurationMs = Date.now() - zoneEnteredAt;

  return {
    message: getMessageForZone(zone),
    zone,
    zoneDurationMs,
  };
}
