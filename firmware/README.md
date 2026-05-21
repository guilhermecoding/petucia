# Firmware Petucia

Sketch mínimo: sensor de umidade do solo no pino **A0**, saída JSON na serial.

## Biblioteca

**Arduino IDE → Gerenciar Bibliotecas → ArduinoJson** (Benoit Blanchon).

## Upload

1. Abra `firmware.ino` (pasta deve chamar-se `firmware`).
2. Conecte o sensor em **A0**.
3. Placa e porta corretas → **Upload**.

## Serial

- **9600** baud
- Primeira linha JSON logo ao ligar; depois a cada **3 s**

Exemplo:

```json
{"soil_moisture":512}
```

Feche o Monitor Serial do IDE antes de rodar `pnpm dev` ou `pnpm start` no computador.
