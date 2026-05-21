import { startArduinoSerial } from "../src/lib/sensors/arduino-serial";

startArduinoSerial();

console.log(
  "[petucia] Ponte serial ativa. Mantenha este terminal aberto junto com pnpm dev.",
);
