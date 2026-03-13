import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { modulePermissions } from "@/lib/permissions";

function moduleFromPath(pathname: string): keyof typeof modulePermissions | null {
  const first = pathname.split("/").filter(Boolean)[0];
  if (!first) return null;
  if (first === "profile") return null;
  if (first in modulePermissions) return first as keyof typeof modulePermissions;
  return null;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const moduleName = moduleFromPath(req.nextUrl.pathname);

    if (moduleName && token?.role) {
      const allowed = modulePermissions[moduleName].read.includes(token.role as never);
      if (!allowed) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  },
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};
