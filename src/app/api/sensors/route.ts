import { startArduinoSerial } from "@/lib/sensors/arduino-serial";
import { sensorStore } from "@/lib/sensors/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

startArduinoSerial();

export async function GET() {
  return Response.json(sensorStore.getStatus());
}
