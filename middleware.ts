import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/feed", "/upload", "/dashboard", "/account", "/settings", "/live", "/discover"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected) {
    // Firebase auth is client-side; we check for a session cookie set on login
    const session = request.cookies.get("fb_session");
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
