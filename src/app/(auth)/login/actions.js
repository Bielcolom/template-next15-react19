"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, deleteSession } from "@/app/lib/session";
import { authenticateUser } from "@/actions/user/actions.mjs";
import { checkRateLimit } from "@/app/lib/rateLimiter";
import { connectDB } from "@/utils/connectDB";
import { normalizeFormPayload } from "@/utils/helpers";
import { DEFAULT_LOCALE, INDEX_URL, getLocalizedPath } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { getValidationMessages } from "@/errors/i18n";
import { handleLoginUserError } from "@/errors/handlers/userErrorHandler";
import {
  createLocalizedFieldErrorResponse,
  createLocalizedGeneralErrorResponse,
} from "@/errors/serverResponses";

const buildLoginSchema = (validationMessages) => z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: validationMessages.INVALID_EMAIL }),
  password: z
    .string()
    .min(8, { message: validationMessages.PASSWORD_MIN_LENGTH })
    .trim(),
});

export async function login(prevState, formData) {
  try {
    const rawData = normalizeFormPayload(formData ?? prevState);
    const locale = rawData?.locale || DEFAULT_LOCALE;

    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
      || headersList.get("x-real-ip")
      || "unknown";
    const rateLimit = await checkRateLimit("login", ip);
    if (!rateLimit.allowed) {
      return createLocalizedGeneralErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, locale);
    }
    const validationMessages = await getValidationMessages(locale);
    const loginSchema = buildLoginSchema(validationMessages);
    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;

    await connectDB();
    const userToAuthenticate = {
      email,
      password,
    };

    const authentication = await authenticateUser({
      user: userToAuthenticate,
    });

    const sessionCreation = await createSession(authentication.user, authentication.permissions);
    if (!sessionCreation) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.SESSION_CREATION_FAILED, locale);
    }

    redirect(getLocalizedPath(INDEX_URL, locale));
  } catch (error) {
    if (error?.message === "NEXT_REDIRECT") {
      throw error;
    }

    const rawData = normalizeFormPayload(formData ?? prevState);
    const locale = rawData?.locale || DEFAULT_LOCALE;

    console.error("Error in login function:", error);
    return handleLoginUserError({ error, locale });
  }
}

export async function logout(locale = DEFAULT_LOCALE) {
  try {
    await deleteSession();
    return { success: true };
  } catch (error) {
    console.error("Error in logout function:", error);
    return createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, locale);
  }
}
