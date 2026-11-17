import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional password gate for online hosting. The app can run any Java code that is sent to it,
 * so a public deployment must not be open to everyone. Set APP_PASSWORD (and optionally
 * APP_USER, default "student") on the host. When APP_PASSWORD is unset (local dev) nothing changes.
 */
export function proxy(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) return NextResponse.next();
  const user = process.env.APP_USER ?? "student";
  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const i = decoded.indexOf(":");
    if (i >= 0 && decoded.slice(0, i) === user && decoded.slice(i + 1) === password) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Java Command Center", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg).*)"],
};
