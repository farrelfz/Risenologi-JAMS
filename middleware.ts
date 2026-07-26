import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const protectedPathPrefixes = ["/app"];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const isProtectedPath = protectedPathPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!isProtectedPath) {
    return response;
  }

  const hasSessionCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));

  if (!hasSessionCookie) {
    const signInUrl = request.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);

    return NextResponse.redirect(signInUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
