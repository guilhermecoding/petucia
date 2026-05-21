import { buildStatus, soilMoistureToZone } from "./messages";
import { loadPersistedState, savePersistedState } from "./persist";
import type { MoistureZone, SensorReading, SensorStatus } from "./types";

type RawArduinoPayload = {
  soil_moisture?: number | string;
  error?: string;
};

class SensorStore {
  private connected = false;
  private reading: SensorReading | null = null;
  private zone: MoistureZone | null = null;
  private zoneEnteredAt: number | null = null;
  private hydrated = false;

  private async hydrate() {
    if (this.hydrated) return;
    this.hydrated = true;

    const saved = await loadPersistedState();
    if (!saved) return;

    this.connected = saved.connected;
    this.reading = saved.reading;
    this.zone = saved.zone;
    this.zoneEnteredAt = saved.zoneEnteredAt;
  }

  private persist() {
    void savePersistedState({
      connected: this.connected,
      reading: this.reading,
      zone: this.zone,
      zoneEnteredAt: this.zoneEnteredAt,
    });
  }

  setConnected(connected: boolean) {
    this.connected = connected;
    this.persist();
  }

  addReading(raw: RawArduinoPayload) {
    if (raw.error) return;

    const soilMoisture = Number(raw.soil_moisture);
    if (Number.isNaN(soilMoisture)) return;

    const now = Date.now();
    const nextZone = soilMoistureToZone(soilMoisture);

    if (this.zone !== nextZone) {
      this.zone = nextZone;
      this.zoneEnteredAt = now;
    }

    this.reading = {
      soil_moisture: soilMoisture,
      receivedAt: now,
    };
    this.connected = true;
    this.persist();
  }

  async getStatus(): Promise<SensorStatus> {
    await this.hydrate();

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
