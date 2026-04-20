export type AppRole = "buyer" | "seller" | "admin" | "government";

export const SESSION_KEYS = {
  tokenPrimary: "authToken",
  tokenAlt1: "token",
  tokenAlt2: "accessToken",
  rolePrimary: "userRole",
  roleAlt: "role",
  cookieToken: "lg_token",
  cookieRole: "lg_role",
} as const;

export function normalizeRole(input: string | null | undefined): AppRole | null {
  if (!input) return null;
  const role = input.toLowerCase();

  if (role === "buyer" || role === "seller" || role === "admin" || role === "government") {
    return role;
  }

  if (role === "government_admin") {
    return "government";
  }

  return null;
}

export function getClientSession() {
  if (typeof window === "undefined") {
    return { token: "", role: null as AppRole | null };
  }

  const token =
    localStorage.getItem(SESSION_KEYS.tokenPrimary) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt1) ||
    localStorage.getItem(SESSION_KEYS.tokenAlt2) ||
    "";

  const role = normalizeRole(
    localStorage.getItem(SESSION_KEYS.rolePrimary) ||
      localStorage.getItem(SESSION_KEYS.roleAlt)
  );

  return { token, role };
}

export function setClientSession(roleInput: string, tokenInput?: string) {
  if (typeof window === "undefined") return;

  if (!tokenInput) {
    throw new Error("setClientSession: a real token is required");
  }

  const role = normalizeRole(roleInput) || "buyer";
  const token = tokenInput;

  localStorage.setItem(SESSION_KEYS.tokenPrimary, token);
  localStorage.setItem(SESSION_KEYS.tokenAlt1, token);
  localStorage.setItem(SESSION_KEYS.tokenAlt2, token);
  localStorage.setItem(SESSION_KEYS.rolePrimary, role);
  localStorage.setItem(SESSION_KEYS.roleAlt, role);

  const maxAge = 60 * 60 * 24 * 7;
  // Add Secure flag when served over HTTPS (all real production deployments)
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SESSION_KEYS.cookieToken}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
  document.cookie = `${SESSION_KEYS.cookieRole}=${encodeURIComponent(role)}; path=/; max-age=${maxAge}; samesite=lax${secure}`;
}

export function clearClientSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEYS.tokenPrimary);
  localStorage.removeItem(SESSION_KEYS.tokenAlt1);
  localStorage.removeItem(SESSION_KEYS.tokenAlt2);
  localStorage.removeItem(SESSION_KEYS.rolePrimary);
  localStorage.removeItem(SESSION_KEYS.roleAlt);
  localStorage.removeItem("lg_refresh_token");

  document.cookie = `${SESSION_KEYS.cookieToken}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${SESSION_KEYS.cookieRole}=; path=/; max-age=0; samesite=lax`;
}

export function getRoleHome(role: AppRole | null) {
  if (role === "buyer") return "/buyer/dashboard";
  if (role === "seller") return "/seller/dashboard";
  if (role === "admin" || role === "government") return "/admin/dashboard";
  return "/";
}
