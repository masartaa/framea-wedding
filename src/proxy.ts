import { NextResponse, type NextRequest } from "next/server";
import {
  isValidInvitationSlug,
  normalizeInvitationSlug,
} from "@/lib/invitation-slug";
import {
  ADMIN_SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";

const PUBLIC_ADMIN_API_PATHS = new Set([
  "/api/admin/login",
  "/api/admin/logout",
]);

const COUPLE_ALLOWED_EXACT_APIS = new Set([
  "/api/admin/session",
  "/api/admin/upload",
]);

function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

function forbiddenJsonResponse(): NextResponse {
  return applyAdminSecurityHeaders(
    NextResponse.json(
      { error: "Akses ditolak. Anda tidak memiliki izin untuk halaman ini." },
      {
        status: 403,
        headers: { "Cache-Control": "no-store" },
      }
    )
  );
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

    if (session.role === "couple") {
      if (COUPLE_ALLOWED_EXACT_APIS.has(pathname)) {
        return applyAdminSecurityHeaders(NextResponse.next());
      }

      const invitationApiMatch = pathname.match(
        /^\/api\/admin\/invitations\/([^/]+)(?:\/.*)?$/
      );
      if (invitationApiMatch) {
        const targetSlug = normalizeInvitationSlug(invitationApiMatch[1] ?? "");
        if (targetSlug === session.slug) {
          return applyAdminSecurityHeaders(NextResponse.next());
        }
      }

      return forbiddenJsonResponse();
    }

    return applyAdminSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/login" || pathname === "/admin/login") {
    if (session) {
      const targetPath =
        session.role === "couple" ? `/admin/${session.slug}` : "/admin";
      return applyAdminSecurityHeaders(
        NextResponse.redirect(new URL(targetPath, request.url))
      );
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/admin")) {
    if (!session) {
      if (pathname === "/admin") {
        return applyAdminSecurityHeaders(
          NextResponse.redirect(new URL("/admin/login", request.url))
        );
      }

      const subRouteMatch = pathname.match(/^\/admin\/([^/]+)(?:\/.*)?$/);
      const requestedSlug = normalizeInvitationSlug(subRouteMatch?.[1] ?? "");
      const clientLoginUrl = isValidInvitationSlug(requestedSlug)
        ? `/login?slug=${encodeURIComponent(requestedSlug)}`
        : "/login";

      return applyAdminSecurityHeaders(
        NextResponse.redirect(new URL(clientLoginUrl, request.url))
      );
    }

    if (session.role === "couple") {
      const ownDashboardPath = `/admin/${session.slug}`;
      if (pathname === "/admin") {
        return applyAdminSecurityHeaders(
          NextResponse.redirect(new URL(ownDashboardPath, request.url))
        );
      }

      const subRouteMatch = pathname.match(/^\/admin\/([^/]+)(?:\/.*)?$/);
      const requestedSlug = normalizeInvitationSlug(subRouteMatch?.[1] ?? "");
      if (requestedSlug !== session.slug) {
        return applyAdminSecurityHeaders(
          NextResponse.redirect(new URL(ownDashboardPath, request.url))
        );
      }
    }

    return applyAdminSecurityHeaders(NextResponse.next());
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/api/admin/:path*"],
};
