import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle generic shortcuts
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/company/dashboard", req.url));
  }

  if (pathname === "/settings") {
    return NextResponse.redirect(new URL("/company/settings", req.url));
  }

  // Allow client-side AuthContext to verify sessions stored in localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/settings",
    "/super-admin/:path*",
    "/company/:path*",
    "/manager/:path*",
    "/staff/:path*",
  ],
};
