import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getClerkPublishableKey, getRuntimeEnv } from "@/lib/env";

const isProtectedRoute = createRouteMatcher(["/app(.*)", "/admin(.*)", "/api/admin(.*)", "/api/exports(.*)"]);

function redirectToCanonicalHost(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host || !host.startsWith("www.")) return null;

  const url = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://gocnscout.com");
  return NextResponse.redirect(url, 301);
}

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const publishableKey = getClerkPublishableKey();
  const secretKey = getRuntimeEnv("CLERK_SECRET_KEY");

  if (publishableKey && secretKey) {
    const clerkHandler = clerkMiddleware(
      async (auth, request) => {
        const canonicalRedirect = redirectToCanonicalHost(request);
        if (canonicalRedirect) return canonicalRedirect;

        if (isProtectedRoute(request)) {
          await auth.protect();
        }
      },
      { publishableKey, secretKey },
    );
    return clerkHandler(req, event);
  }

  const canonicalRedirect = redirectToCanonicalHost(req);
  if (canonicalRedirect) return canonicalRedirect;

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
