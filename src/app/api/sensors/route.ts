import { startArduinoSerial } from "@/lib/sensors/arduino-serial";
import { sensorStore } from "@/lib/sensors/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  startArduinoSerial();
  return Response.json(await sensorStore.getStatus());
}
