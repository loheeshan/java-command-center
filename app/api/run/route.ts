import { forward, readJson } from "@/lib/execution/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const r = await readJson(req, 400_000);
  if (!r.ok) return r.res;
  return forward("/run", { method: "POST", body: r.body }, 60_000);
}
