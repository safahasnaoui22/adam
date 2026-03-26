// middleware.ts (update your existing middleware)
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const pathname = req.nextUrl.pathname;

    // Check if user is trying to access dashboard routes
    if (pathname.startsWith("/dashboard") && token?.user?.role === "RESTAURANT_OWNER") {
      try {
        // You might want to cache this check
        const response = await fetch(`${req.nextUrl.origin}/api/restaurant/status`, {
          headers: {
            cookie: req.headers.get("cookie") || "",
          },
        });
        
        const data = await response.json();
        
        if (data.accountStatus === "SUSPENDED") {
          return NextResponse.redirect(new URL("/auth/suspended", req.url));
        }
        
        if (data.accountStatus === "PENDING") {
          return NextResponse.redirect(new URL("/auth/pending", req.url));
        }
      } catch (error) {
        console.error("Failed to check account status:", error);
      }
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
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};