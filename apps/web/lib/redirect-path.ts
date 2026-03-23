export function normalizeNextPath(value: string | null | undefined) {
  if (!value) {
    return "/lobby";
  }

  if (!value.startsWith("/")) {
    return "/lobby";
  }

  if (value.startsWith("//")) {
    return "/lobby";
  }

  if (value.startsWith("/auth/")) {
    return "/lobby";
  }

  if (value === "/login") {
    return "/lobby";
  }

  return value;
}
