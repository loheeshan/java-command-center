import { forward, readJson } from "@/lib/execution/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const r = await readJson(req, 600_000);
  if (!r.ok) return r.res;
  return forward("/project/test", { method: "POST", body: r.body }, 280_000);
}
