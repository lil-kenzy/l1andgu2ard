import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/base";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.toString();
  const targetUrl = `${getBackendBaseUrl()}/api/properties${search ? `?${search}` : ""}`;

  try {
    const upstream = await fetch(targetUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = await upstream.text();

    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Property service unavailable",
      },
      { status: 503 }
    );
  }
}
