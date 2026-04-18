import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get("lg_token")?.value;
  const roleCookie = request.cookies.get("lg_role")?.value?.toLowerCase();

  const isBuyerPath = pathname.startsWith("/buyer");
  const isSellerPath = pathname.startsWith("/seller");
  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/legal/dashboard");

  if (!isBuyerPath && !isSellerPath && !isAdminPath) {
    return NextResponse.next();
  }

  if (!token || !roleCookie) {
    const loginRole = isSellerPath ? "seller" : isAdminPath ? "admin" : "buyer";
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = `?role=${loginRole}&redirect=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(url);
  }

  if (isBuyerPath && roleCookie !== "buyer") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "?role=buyer";
    return NextResponse.redirect(url);
  }

  if (isSellerPath && roleCookie !== "seller") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "?role=seller";
    return NextResponse.redirect(url);
  }

  if (isAdminPath && roleCookie !== "admin" && roleCookie !== "government" && roleCookie !== "government_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.search = "?role=admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buyer/:path*", "/seller/:path*", "/admin/:path*", "/legal/dashboard"],
};
