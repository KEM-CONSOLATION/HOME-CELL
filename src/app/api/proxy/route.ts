import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const SERVICE_URLS = {
  base: process.env.NEXT_PUBLIC_API_BASE_URL,
  invoice: process.env.NEXT_PUBLIC_INVOICE_API_BASE_URL,
};

function isFormDataContentType(contentType: string): boolean {
  return (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  );
}

function extractErrorMessage(err: unknown): string {
  const e = err as {
    message?: string;
    status?: number;
    response?: { status?: number; statusText?: string; data?: unknown };
  };
  const data = e?.response?.data as
    | undefined
    | string
    | { message?: string; error?: unknown; detail?: unknown; title?: string };

  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof (data as { error?: string }).error === "string")
      return (data as { error: string }).error;
    if (typeof data.title === "string" && typeof data.detail === "string") {
      return `${data.title}: ${data.detail}`;
    }
  }
  return e?.message || "An unknown error occurred";
}

async function handler(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl;
  const search = url.searchParams;

  const service = search.get("service") || "";
  const endpoint = search.get("endpoint") || "";
  const responseType = search.get("responseType") || "";

  if (!service || !(service in SERVICE_URLS) || !SERVICE_URLS[service as keyof typeof SERVICE_URLS]) {
    return NextResponse.json(
      {
        error: "Invalid service",
        message: `Service '${service}' not found. Available services: ${Object.keys(
          SERVICE_URLS,
        ).join(", ")}`,
      },
      { status: 400 },
    );
  }

  const baseURL = SERVICE_URLS[service as keyof typeof SERVICE_URLS]!;
  const targetURL = `${baseURL}${endpoint}`;

  // Preserve the WETH-TAX query contract:
  // /api/proxy?service=base&endpoint=/foo&anyOtherParam=...
  const forwardedParams = new URLSearchParams(url.searchParams);
  forwardedParams.delete("service");
  forwardedParams.delete("endpoint");
  forwardedParams.delete("responseType");
  if (!forwardedParams.has("_t")) forwardedParams.set("_t", Date.now().toString());

  const finalURL =
    forwardedParams.toString().length > 0
      ? `${targetURL}?${forwardedParams.toString()}`
      : targetURL;

  const allowedHeaders = new Set([
    "authorization",
    "content-type",
    "content-length",
    "accept",
    "user-agent",
    "accept-encoding",
    "accept-language",
    "x-account-id",
  ]);

  const outboundHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (allowedHeaders.has(key.toLowerCase())) outboundHeaders.set(key, value);
  });

  outboundHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
  outboundHeaders.set("Pragma", "no-cache");
  outboundHeaders.set("Expires", "0");
  outboundHeaders.set(
    "X-Request-ID",
    `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  );

  const method = req.method.toUpperCase();
  const hasBody = !["GET", "HEAD"].includes(method);

  const contentType = req.headers.get("content-type") || "";
  const isFormData = isFormDataContentType(contentType);

  let body: BodyInit | undefined;
  if (hasBody) {
    // For form-data / urlencoded, forwarding raw bytes preserves boundary/encoding.
    if (isFormData) {
      const ab = await req.arrayBuffer();
      body = ab.byteLength ? ab : undefined;
    } else {
      const ab = await req.arrayBuffer();
      body = ab.byteLength ? ab : undefined;
    }
  }

  const isBlobRequest = responseType === "blob";

  try {
    const upstream = await fetch(finalURL, {
      method,
      headers: outboundHeaders,
      body,
      redirect: "manual",
    });

    const resHeaders = new Headers();
    resHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    resHeaders.set("Pragma", "no-cache");
    resHeaders.set("Expires", "0");
    resHeaders.set("Surrogate-Control", "no-store");

    if (isBlobRequest) {
      const ab = await upstream.arrayBuffer();
      const ct = upstream.headers.get("content-type") || "application/octet-stream";
      resHeaders.set("Content-Type", ct);

      const cd = upstream.headers.get("content-disposition");
      if (cd) resHeaders.set("Content-Disposition", cd);

      const cl = upstream.headers.get("content-length");
      if (cl) resHeaders.set("Content-Length", cl);

      return new NextResponse(ab, { status: upstream.status, headers: resHeaders });
    }

    const text = await upstream.text();
    try {
      const json = text ? JSON.parse(text) : null;
      return NextResponse.json(json, { status: upstream.status, headers: resHeaders });
    } catch {
      // Non-JSON upstream responses still come back as text.
      resHeaders.set("Content-Type", upstream.headers.get("content-type") || "text/plain");
      return new NextResponse(text, { status: upstream.status, headers: resHeaders });
    }
  } catch (err) {
    const errorMessage = extractErrorMessage(err);
    return NextResponse.json(
      {
        error: errorMessage,
        status: 500,
        statusText: "Proxy Error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

