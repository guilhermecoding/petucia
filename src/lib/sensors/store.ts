import { buildStatus, soilMoistureToZone } from "./messages";
import type { MoistureZone, SensorReading, SensorStatus } from "./types";

type RawArduinoPayload = {
  soil_moisture?: number;
  error?: string;
};

class SensorStore {
  private connected = false;
  private reading: SensorReading | null = null;
  private zone: MoistureZone | null = null;
  private zoneEnteredAt: number | null = null;

  setConnected(connected: boolean) {
    this.connected = connected;
  }

  addReading(raw: RawArduinoPayload) {
    if (raw.error) return;
    if (raw.soil_moisture === undefined) return;

    const now = Date.now();
    const nextZone = soilMoistureToZone(raw.soil_moisture);

    if (this.zone !== nextZone) {
      this.zone = nextZone;
      this.zoneEnteredAt = now;
    }

    this.reading = {
      soil_moisture: raw.soil_moisture,
      receivedAt: now,
    };
    this.connected = true;
  }

  getStatus(): SensorStatus {
    const { message, zone, zoneDurationMs } = buildStatus(
      this.connected,
      this.reading,
      this.zone,
      this.zoneEnteredAt,
    );

    return {
      connected: this.connected,
      reading: this.reading,
      message,
      zone,
      zoneDurationMs,
    };
  }
}

export const sensorStore = new SensorStore();
