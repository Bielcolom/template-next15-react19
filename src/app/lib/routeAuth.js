import "server-only";
import { redirect } from "next/navigation";
import { hasErrorCode } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import { DEFAULT_LOCALE, INDEX_URL, LOGIN_URL, getLocalizedPath } from "@/utils/urls";
import { requirePermission } from "./session";

export async function requireRoutePermission(requiredPermissions, locale = DEFAULT_LOCALE) {
  try {
    return await requirePermission(requiredPermissions);
  } catch (error) {
    if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
      return redirect(getLocalizedPath(INDEX_URL, locale));
    }

    if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED) || hasErrorCode(error, ERROR_CODES.INVALID_SESSION)) {
      return redirect(getLocalizedPath(LOGIN_URL, locale));
    }

    throw error;
  }
}
