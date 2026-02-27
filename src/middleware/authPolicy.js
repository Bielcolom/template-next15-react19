import { normalizePermissions } from "../utils/helpers";
import { ROUTES } from "../utils/urls";

export const AUTH_ACTIONS = {
  ALLOW: "allow",
  REDIRECT_LOGIN: "redirect_login",
  REDIRECT_HOME: "redirect_home",
};

export const evaluateAuthPolicy = ({ pathWithoutLocale, payload }) => {
  const isPublicRoute = ROUTES.PUBLIC.includes(pathWithoutLocale);
  const isPrivateRoute = ROUTES.PRIVATE.includes(pathWithoutLocale);
  const isSuperAdminRoute = ROUTES.SUPERADMIN.includes(pathWithoutLocale);

  if (!payload) {
    if (isPrivateRoute || isSuperAdminRoute) {
      return { action: AUTH_ACTIONS.REDIRECT_LOGIN, clearCookies: false };
    }
    return { action: AUTH_ACTIONS.ALLOW, clearCookies: false };
  }

  const expiresAtMs = new Date(payload.expiresAt).getTime();
  if (!Number.isFinite(expiresAtMs) || expiresAtMs < Date.now()) {
    return { action: AUTH_ACTIONS.REDIRECT_LOGIN, clearCookies: true };
  }

  const permissions = normalizePermissions(payload?.permissions);

  if (isPrivateRoute && !permissions.includes("admin_access")) {
    return { action: AUTH_ACTIONS.REDIRECT_HOME, clearCookies: false };
  }

  if (isSuperAdminRoute && !permissions.includes("superadmin_access")) {
    return { action: AUTH_ACTIONS.REDIRECT_HOME, clearCookies: false };
  }

  if (isPublicRoute) {
    return { action: AUTH_ACTIONS.REDIRECT_HOME, clearCookies: false };
  }

  return { action: AUTH_ACTIONS.ALLOW, clearCookies: false };
};
