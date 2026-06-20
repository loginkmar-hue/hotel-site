import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "hotel_admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Защищаем /admin/*, кроме страницы входа
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/login")) {
    return NextResponse.next();
  }
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  const got = req.cookies.get(ADMIN_COOKIE)?.value;
  if (got !== expected) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
