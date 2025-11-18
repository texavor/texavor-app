import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/settings",
  "/projects",
  "/onboarding",
];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("_easywrite_session")?.value;
  const pathname = req.nextUrl.pathname;

  // Skip all static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  )
    return NextResponse.next();

  // --- 1. If unauthenticated and visiting protected page → redirect to login ---
  if (!token && PROTECTED_ROUTES.some((path) => pathname.startsWith(path))) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // --- 2. If authenticated and visiting auth page → redirect to dashboard ---
  if (token && AUTH_ROUTES.some((path) => pathname.startsWith(path))) {
    const dashboardUrl = new URL("/dashboard", req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // --- 3. If visiting root ("/"), decide based on token ---
  if (pathname === "/") {
    if (token) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    } else {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Default: allow
  return NextResponse.next();
}
