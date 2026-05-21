import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { MoistureZone, SensorReading } from "./types";

export type PersistedSensorState = {
  connected: boolean;
  reading: SensorReading | null;
  zone: MoistureZone | null;
  zoneEnteredAt: number | null;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "sensor-state.json");

export async function loadPersistedState(): Promise<PersistedSensorState | null> {
  try {
    const raw = await readFile(STATE_FILE, "utf8");
    return JSON.parse(raw) as PersistedSensorState;
  } catch {
    return null;
  }
}

export async function savePersistedState(state: PersistedSensorState) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(state), "utf8");
}
