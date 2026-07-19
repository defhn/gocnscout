import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/admin(.*)", "/api/admin(.*)", "/api/exports(.*)"]);

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

function redirectToCanonicalHost(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host || !host.startsWith("www.")) return null;

  const url = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://gocnscout.com");
  return NextResponse.redirect(url, 301);
}

export default clerkEnabled
  ? clerkMiddleware(async (auth, req) => {
      const canonicalRedirect = redirectToCanonicalHost(req);
      if (canonicalRedirect) return canonicalRedirect;

      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function middleware(req: NextRequest) {
      const canonicalRedirect = redirectToCanonicalHost(req);
      if (canonicalRedirect) return canonicalRedirect;

      return NextResponse.next();
    };

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
