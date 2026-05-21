import { sensorStore } from "@/lib/sensors/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await sensorStore.getStatus());
}
