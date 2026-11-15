import { type NextRequest, NextResponse } from "next/server";
import { markdownRewrite } from "@/lib/agent";

/**
 * Markdown content negotiation. `Accept: text/markdown` (or a `.md` URL) is
 * rewritten to the `/md` route handler; everything else passes through. Both
 * branches send `Vary: Accept`, since one URL now has two representations.
 */
export function proxy(request: NextRequest) {
  const target = markdownRewrite(
    request.nextUrl.pathname,
    request.headers.get("accept")
  );
  const response = target
    ? NextResponse.rewrite(new URL(target, request.url))
    : NextResponse.next();
  response.headers.append("Vary", "Accept");
  return response;
}

export const config = {
  // Pages only: skip Next internals and files with an extension, except `.md`.
  matcher: ["/((?!_next/|.*\\.(?!md$)[^/]+$).*)"],
};
