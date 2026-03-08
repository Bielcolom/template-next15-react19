import "server-only";
import { hasErrorCode } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import { createLocalizedDataErrorResponse } from "@/errors/serverResponses";

export async function handleUserRolesDataError({
  error,
  locale,
  fallbackCode = ERROR_CODES.FETCH_USER_ROLE_FAILED,
  fallbackData = null,
}) {
  if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
    return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, fallbackData, locale);
  }

  if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
    return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, fallbackData, locale);
  }

  return createLocalizedDataErrorResponse(fallbackCode, fallbackData, locale);
}
