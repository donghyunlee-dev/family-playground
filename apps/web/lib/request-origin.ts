export function getRequestOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (host) {
    return `${forwardedProto ?? "http"}://${host}`;
  }

  return new URL(request.url).origin;
}
