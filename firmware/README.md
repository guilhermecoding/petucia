# Firmware Petucia

O sketch usa apenas o sensor de umidade do solo (pino **A0**) e a biblioteca **ArduinoJson**.

## Instalar no Arduino IDE

1. **Sketch → Incluir Biblioteca → Gerenciar Bibliotecas…**
2. Instale **ArduinoJson** (autor: Benoit Blanchon).
3. Compile e faça upload.

## Saída serial

A cada 10 s o Arduino envia uma linha JSON, por exemplo:

```json
{"soil_moisture":512}
```

Baud rate: **9600**. A primeira leitura é enviada logo ao ligar; as seguintes, a cada 10 s.

## Ler no Next.js

Em um terminal: `pnpm dev`  
Em outro: `pnpm serial` (abre a porta definida em `ARDUINO_PORT` no `.env.local`)

Feche o Monitor Serial do Arduino IDE antes — só um programa pode usar a COM.
