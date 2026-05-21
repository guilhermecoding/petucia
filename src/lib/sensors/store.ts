import { buildStatus, soilMoistureToZone } from "./messages";
import {
  loadPersistedState,
  savePersistedState,
  type PersistedSensorState,
} from "./persist";
import type { SensorStatus } from "./types";

type RawArduinoPayload = {
  soil_moisture?: number | string;
  error?: string;
};

const emptyState = (): PersistedSensorState => ({
  connected: false,
  reading: null,
  zone: null,
  zoneEnteredAt: null,
});

class SensorStore {
  async setConnected(connected: boolean) {
    const state = (await loadPersistedState()) ?? emptyState();
    state.connected = connected;
    await savePersistedState(state);
  }

  async addReading(raw: RawArduinoPayload) {
    if (raw.error) return;

    const soilMoisture = Number(raw.soil_moisture);
    if (Number.isNaN(soilMoisture)) return;

    const state = (await loadPersistedState()) ?? emptyState();
    const now = Date.now();
    const nextZone = soilMoistureToZone(soilMoisture);

    if (state.zone !== nextZone) {
      state.zone = nextZone;
      state.zoneEnteredAt = now;
    }

    state.reading = {
      soil_moisture: soilMoisture,
      receivedAt: now,
    };
    state.connected = true;

    await savePersistedState(state);
  }

  async getStatus(): Promise<SensorStatus> {
    const state = (await loadPersistedState()) ?? emptyState();

    const { message, zone, zoneDurationMs } = buildStatus(
      state.connected,
      state.reading,
      state.zone,
      state.zoneEnteredAt,
    );

    return {
      connected: state.connected,
      reading: state.reading,
      message,
      zone,
      zoneDurationMs,
    };
  }
}

export const sensorStore = new SensorStore();
