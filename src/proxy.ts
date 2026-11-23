import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";

const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
]);

function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_API_PATHS.has(pathname)) {
      return applyAdminSecurityHeaders(NextResponse.next());
    }

    if (!session) {
      return applyAdminSecurityHeaders(
        NextResponse.json(
          { error: "Sesi admin tidak valid. Silakan login kembali." },
          {
            status: 401,
            headers: { "Cache-Control": "no-store" },
          }
        )
      );
    }

    return applyAdminSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/admin/login") {
    if (session) {
      const dashboardUrl = new URL("/admin", request.url);
      return applyAdminSecurityHeaders(NextResponse.redirect(dashboardUrl));
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      return applyAdminSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
