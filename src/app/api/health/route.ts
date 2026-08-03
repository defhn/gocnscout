import { NextResponse } from "next/server";

// Keep Dokploy/container health checks independent of Neon. This endpoint must
// remain a static response so probes cannot wake the database compute.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({ ok: true });
}
