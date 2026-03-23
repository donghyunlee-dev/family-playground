import { NextResponse } from "next/server";
import { getRequestOrigin } from "@/lib/request-origin";

function createPopupHtml(origin: string, payload: Record<string, string>) {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <title>Google Login</title>
  </head>
  <body>
    <script>
      (function () {
        var origin = ${JSON.stringify(origin)};
        var payload = ${JSON.stringify(payload)};

        if (window.opener) {
          window.opener.postMessage(payload, origin);
        }

        window.close();
      })();
    </script>
  </body>
</html>`;
}

function createPopupResponse(origin: string, payload: Record<string, string>) {
  return new NextResponse(createPopupHtml(origin, payload), {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    return createPopupResponse(origin, {
      type: "family-playground-auth-error",
      error,
      detail: errorDescription ?? "",
      next,
    });
  }

  if (!code) {
    return createPopupResponse(origin, {
      type: "family-playground-auth-error",
      error: "missing-code",
      next,
    });
  }

  return createPopupResponse(origin, {
    type: "family-playground-auth-code",
    code,
    next,
  });
}
