import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

import { sensorStore } from "./store";

let started = false;

export function startArduinoSerial() {
  if (started) return;
  started = true;

  const portPath = process.env.ARDUINO_PORT;
  if (!portPath) {
    console.warn(
      "[petucia] Defina ARDUINO_PORT (ex.: COM3) no .env.local para ler o Arduino.",
    );
    return;
  }

  const port = new SerialPort({ path: portPath, baudRate: 9600 });
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line: string) => {
    try {
      const data = JSON.parse(line.trim()) as Record<string, unknown>;
      sensorStore.addReading(data);
    } catch {
      console.warn("[petucia] Linha serial ignorada:", line);
    }
  });

  port.on("open", () => {
    console.log(`[petucia] Arduino conectado em ${portPath}`);
    sensorStore.setConnected(true);
  });

  port.on("close", () => sensorStore.setConnected(false));

  port.on("error", (err) => {
    console.error("[petucia] Erro na porta serial:", err.message);
    sensorStore.setConnected(false);
  });
}
