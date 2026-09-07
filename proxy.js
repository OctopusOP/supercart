import { NextResponse } from "next/server";

export default function proxy(request) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Define exact static public routes
  const exactPublicRoutes = [
    "/",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/cart",
    "/products",
  ];

  // 2. Check for dynamic public routes (matches /products/123, /products/abc, etc.)
  const isDynamicPublicRoute = pathname.startsWith("/products/");

  // 3. Determine if current path is allowed publicly
  const isPublicRoute = exactPublicRoutes.includes(pathname) || isDynamicPublicRoute;

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 4. Redirect unauthenticated users to login for protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes, static Next files, and common static assets
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};