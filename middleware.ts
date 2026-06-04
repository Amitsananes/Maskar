import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/submit") && role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/office", req.url));
    }
    if (path.startsWith("/office") && role !== "OFFICE" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/submit", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/submit/:path*", "/office/:path*"],
};
