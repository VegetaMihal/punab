import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Session refresh + route gating.
 * - Auth: Supabase `getUser()` (required).
 * - PUNAB `/admin`: requires a session here; role = admin is enforced in `admin/layout.tsx` + `assertAdmin()` (Prisma).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin");
  const isDashboardRoute = path.startsWith("/dashboard");

  /** BloodHero admin: signed-in + `rpc('is_bloodhero_admin')` (PUNAB admin OR bloodhero_admin_access). */
  const isBloodHeroAdminArea =
    path === "/bloodhero/admin" || path.startsWith("/bloodhero/admin/");
  const isBloodHeroAdminLogin =
    path === "/bloodhero/admin/login" || path.startsWith("/bloodhero/admin/login/");

  if (isBloodHeroAdminArea) {
    if (isBloodHeroAdminLogin) {
      if (user) {
        const { data: allowed } = await supabase.rpc("is_bloodhero_admin");
        if (allowed === true) {
          return NextResponse.redirect(new URL("/bloodhero/admin", request.url));
        }
      }
    } else {
      if (!user) {
        const login = new URL("/bloodhero/admin/login", request.url);
        login.searchParams.set("redirect", path);
        return NextResponse.redirect(login);
      }
      const { data: allowed } = await supabase.rpc("is_bloodhero_admin");
      if (allowed !== true) {
        const login = new URL("/bloodhero/admin/login", request.url);
        login.searchParams.set("reason", "forbidden");
        return NextResponse.redirect(login);
      }
    }
  }

  if (isDashboardRoute || isAdminRoute) {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("redirect", path);
      return NextResponse.redirect(login);
    }
  }

  // PUNAB /admin: require a signed-in user only here. Role is enforced in `src/app/admin/layout.tsx`
  // and `assertAdmin()` via Prisma — avoids PostgREST/RLS/.single() mismatches blocking the whole admin UI.

  return supabaseResponse;
}
