"use client";

import { useEffect, useState } from "react";

import { soilMoistureToPercent } from "@/lib/sensors/messages";
import type { SensorStatus } from "@/lib/sensors/types";

const POLL_INTERVAL_MS = 3_000;

export function PetuciaStatus() {
  const [status, setStatus] = useState<SensorStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/sensors", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao buscar sensores");
        const data = (await res.json()) as SensorStatus;
        if (!cancelled) {
          setStatus(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("Não foi possível conectar à API de sensores.");
        }
      }
    }

    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (error) {
    return <p className="text-sm text-red-200 drop-shadow-sm">{error}</p>;
  }

  if (!status) {
    return <p className="text-sm text-white/70 drop-shadow-sm">Carregando...</p>;
  }

  const reading = status.reading;
  const waitingForReading = status.connected && !reading;

  return (
    <div className="space-y-3 drop-shadow-md">
      <p className="text-4xl font-bold leading-snug text-white md:text-6xl">
        {status.message}
      </p>

      {status.connected && (
        <p className="text-xs font-medium text-emerald-200">Arduino conectado</p>
      )}

      {reading ? (
        <p className="text-sm text-white/85">
          Umidade do solo:{" "}
          <span className="font-mono font-medium text-white">
            {soilMoistureToPercent(reading.soil_moisture)}%
          </span>
        </p>
      ) : waitingForReading ? (
        <p className="text-sm text-white/75">
          Aguardando primeira leitura do Arduino (alguns segundos).
        </p>
      ) : status.message === "Sem leituras recentes do Arduino..." ? (
        <p className="text-sm text-white/75">
          Use <code className="rounded bg-white/20 px-1 text-white">pnpm start</code>{" "}
          (site + serial) ou rode <code className="rounded bg-white/20 px-1 text-white">pnpm serial</code>{" "}
          junto com o servidor. Feche o Monitor Serial do Arduino IDE.
        </p>
      ) : !status.connected ? (
        <p className="text-sm text-white/75">
          Conecte o Arduino via USB e defina{" "}
          <code className="rounded bg-white/20 px-1 text-white">
            ARDUINO_PORT
          </code>{" "}
          no .env.local (ex.: COM6). Reinicie o servidor depois.
        </p>
      ) : null}

      {!status.connected && reading && (
        <p className="text-xs text-amber-200">Arduino desconectado.</p>
      )}
    </div>
  );
}
