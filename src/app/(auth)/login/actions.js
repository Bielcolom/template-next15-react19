"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/app/lib/session";
import { authenticateUser } from "@/actions/user/actions.mjs";
import { connectDB } from "@/utils/connectDB";
import { DEFAULT_LOCALE, INDEX_URL, getLocalizedPath } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { getValidationMessages } from "@/errors/i18n";
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

const normalizeLoginPayload = (payload) => {
  if (payload instanceof FormData) {
    return Object.fromEntries(payload);
  }

  return payload || {};
};

export async function login(prevState, formData) {
  try {
    const rawData = normalizeLoginPayload(formData ?? prevState);
    const locale = rawData?.locale || DEFAULT_LOCALE;
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

    if (authentication.status !== "authenticated") {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.INVALID_CREDENTIALS, locale);
    }

    const sessionCreation = await createSession(authentication.user, authentication.permissions);
    if (!sessionCreation) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.SESSION_CREATION_FAILED, locale);
    }

    redirect(getLocalizedPath(INDEX_URL, locale));
  } catch (error) {
    if (error?.message === "NEXT_REDIRECT") {
      throw error;
    }

    console.error("Error in login function:", error);
    const rawData = normalizeLoginPayload(formData ?? prevState);
    return createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, rawData?.locale || DEFAULT_LOCALE);
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
