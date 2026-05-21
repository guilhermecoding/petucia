import { ReadlineParser } from "@serialport/parser-readline";
import { SerialPort } from "serialport";

import { sensorStore } from "./store";

type SerialGlobal = {
  __petuciaSerialPort?: SerialPort;
  __petuciaSerialInitiated?: boolean;
};

const globalStore = globalThis as typeof globalThis & SerialGlobal;

function attachListeners(port: SerialPort, portPath: string) {
  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  parser.on("data", (line: string) => {
    void (async () => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("{")) return;

      try {
        const data = JSON.parse(trimmed) as Record<string, unknown>;
        await sensorStore.addReading(data);
        console.log("[petucia] Leitura recebida:", trimmed);
      } catch {
        console.warn("[petucia] Linha serial ignorada:", trimmed);
      }
    })();
  });

  port.on("open", () => {
    console.log(`[petucia] Arduino conectado em ${portPath}`);
    void sensorStore.setConnected(true);
  });

  port.on("close", () => {
    void sensorStore.setConnected(false);
  });

  port.on("error", (err) => {
    console.error("[petucia] Erro na porta serial:", err.message);
    void sensorStore.setConnected(false);
  });
}

export function startArduinoSerial() {
  const existing = globalStore.__petuciaSerialPort;
  if (existing?.isOpen || existing?.opening) {
    return;
  }
  if (globalStore.__petuciaSerialInitiated) {
    return;
  }
  globalStore.__petuciaSerialInitiated = true;

  const portPath = process.env.ARDUINO_PORT;
  if (!portPath) {
    globalStore.__petuciaSerialInitiated = false;
    console.warn(
      "[petucia] Defina ARDUINO_PORT (ex.: COM6) no .env.local para ler o Arduino.",
    );
    return;
  }

  const port = new SerialPort({ path: portPath, baudRate: 9600 }, (err) => {
    if (err) {
      globalStore.__petuciaSerialPort = undefined;
      globalStore.__petuciaSerialInitiated = false;
      console.error("[petucia] Erro ao abrir porta serial:", err.message);
      if (err.message.includes("Access denied")) {
        console.error(
          "[petucia] A porta está em uso. Feche o Monitor Serial do Arduino IDE e reinicie (pnpm dev).",
        );
      }
      void sensorStore.setConnected(false);
    }
  });

  globalStore.__petuciaSerialPort = port;
  attachListeners(port, portPath);
}
