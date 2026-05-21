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

Baud rate: **9600**.
