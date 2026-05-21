export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startArduinoSerial } = await import("@/lib/sensors/arduino-serial");
    startArduinoSerial();
  }
}
