import { forward } from "@/lib/execution/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return forward("/health", { method: "GET" }, 5_000);
}
