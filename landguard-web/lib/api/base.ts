export function getBackendBaseUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const trimmed = candidate.replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed.replace(/\/api$/, "") : trimmed;
}
