import "server-only";
import { hasErrorCode } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import {
  createLocalizedDataErrorResponse,
  createLocalizedFieldErrorResponse,
  createLocalizedGeneralErrorResponse,
} from "@/errors/serverResponses";

export async function handleRegisterUserError({ error, locale }) {
  if (hasErrorCode(error, ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED)) {
    return createLocalizedFieldErrorResponse("email", ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED, locale);
  }

  if (hasErrorCode(error, ERROR_CODES.EMAIL_ALREADY_REGISTERED)) {
    return createLocalizedFieldErrorResponse("email", ERROR_CODES.EMAIL_ALREADY_REGISTERED, locale);
  }

  return createLocalizedFieldErrorResponse("email", ERROR_CODES.REGISTRATION_FAILED, locale);
}

export async function handleLoginUserError({ error, locale }) {
  if (hasErrorCode(error, ERROR_CODES.INVALID_CREDENTIALS)) {
    return createLocalizedFieldErrorResponse("email", ERROR_CODES.INVALID_CREDENTIALS, locale);
  }

  return createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, locale);
}

export async function handleUsersDataError({ error, locale, fallbackCode, fallbackData = null,}) {
  if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
    return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, fallbackData, locale);
  }

  if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
    return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, fallbackData, locale);
  }

  return createLocalizedDataErrorResponse(fallbackCode, fallbackData, locale);
}
