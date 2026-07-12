import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const pathLower = path.toLowerCase();
  if (
    path !== pathLower &&
    (pathLower === "/forums" || pathLower.startsWith("/forums/"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathLower;
    return NextResponse.redirect(url);
  }

  const response = await updateSession(request);
  response.headers.set("x-pathname", path);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
