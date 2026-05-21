"use client";

import { useEffect, useState } from "react";

import type { SensorStatus } from "@/lib/sensors/types";

const POLL_INTERVAL_MS = 5_000;

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
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!status) {
    return <p className="text-sm text-neutral-500">Carregando...</p>;
  }

  const reading = status.reading;
  const waitingForReading =
    status.connected && !reading;

  return (
    <div className="space-y-3">
      <p className="text-2xl font-medium leading-snug">{status.message}</p>

      {status.connected && (
        <p className="text-xs font-medium text-green-700">Arduino conectado</p>
      )}

      {reading ? (
        <p className="text-sm text-neutral-600">
          Umidade do solo:{" "}
          <span className="font-mono">{reading.soil_moisture}</span>
        </p>
      ) : waitingForReading ? (
        <p className="text-sm text-neutral-500">
          Primeira leitura em até 10 segundos (intervalo do firmware).
        </p>
      ) : !status.connected ? (
        <p className="text-sm text-neutral-500">
          Conecte o Arduino via USB e defina{" "}
          <code className="rounded bg-neutral-100 px-1">ARDUINO_PORT</code> no
          .env.local (ex.: COM6). Reinicie o servidor depois.
        </p>
      ) : null}

      {!status.connected && reading && (
        <p className="text-xs text-amber-700">Arduino desconectado.</p>
      )}
    </div>
  );
}
