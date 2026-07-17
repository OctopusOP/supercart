import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("auth_token")?.value;

  const pathname = request.nextUrl.pathname;

  const publicRoutes = ["/login", "/register","/about","/contact", "/"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If not logged in, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Exclude API routes, static files, image optimizations, and .png files
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
    //Include Secured Routes
    "/profile/:path*",
    "/dashboard/:path*",
  ],
};
