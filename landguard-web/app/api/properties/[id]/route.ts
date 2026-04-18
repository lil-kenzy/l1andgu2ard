import { NextRequest, NextResponse } from "next/server";
import { getBackendBaseUrl } from "@/lib/api/base";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  const id = context.params.id;
  const targetUrl = `${getBackendBaseUrl()}/api/properties/${id}`;

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
        message: "Property details service unavailable",
      },
      { status: 503 }
    );
  }
}
