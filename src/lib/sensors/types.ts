export type SensorReading = {
  soil_moisture: number;
  receivedAt: number;
};

export type MoistureZone = "comfortable" | "warning" | "thirsty";

export type PetuciaMessage =
  | "Estou bem tranquila 😌"
  | "Estou bem, mas estou ficando com sede 😕"
  | "Estou com sede 🥵"
  | "Aguardando leituras do Arduino..."
  | "Conectada! Aguardando primeira leitura...";

export type SensorStatus = {
  connected: boolean;
  reading: SensorReading | null;
  message: PetuciaMessage;
  zone: MoistureZone | null;
  zoneDurationMs: number;
};
