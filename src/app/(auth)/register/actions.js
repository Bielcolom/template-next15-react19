"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { registerUser as registerUserRecord } from "@/actions/user/actions.mjs";
import { connectDB } from "@/utils/connectDB";
import { createSession } from "@/app/lib/session";
import { checkRateLimit } from "@/app/lib/rateLimiter";
import { ROLES } from "@/utils/constants";
import { DEFAULT_LOCALE, INDEX_URL, getLocalizedPath } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { getValidationMessages } from "@/errors/i18n";
import { handleRegisterUserError } from "@/errors/handlers/userErrorHandler";
import { createLocalizedGeneralErrorResponse } from "@/errors/serverResponses";

const buildRegisterSchema = (validationMessages) => z.object({
  name: z
    .string()
    .min(3, { message: validationMessages.NAME_MIN_LENGTH })
    .trim(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ message: validationMessages.INVALID_EMAIL }),
  password: z
    .string()
    .min(8, { message: validationMessages.PASSWORD_MIN_LENGTH })
    .trim(),
  confirmPassword: z
    .string()
    .min(8, { message: validationMessages.PASSWORD_CONFIRM_MIN_LENGTH })
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: validationMessages.PASSWORDS_DO_NOT_MATCH,
  path: ["confirmPassword"],
});

const normalizeRegisterPayload = (payload) => {
  if (payload instanceof FormData) {
    return Object.fromEntries(payload);
  }

  return payload || {};
};

export async function createUser(prevState, formData) {
  try {
    const rawData = normalizeRegisterPayload(formData ?? prevState);
    const locale = rawData?.locale || DEFAULT_LOCALE;

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim()
      || headersList.get("x-real-ip")
      || "unknown";
    const rateLimit = await checkRateLimit("register", ip);
    if (!rateLimit.allowed) {
      return createLocalizedGeneralErrorResponse(ERROR_CODES.RATE_LIMIT_EXCEEDED, locale);
    }
    const validationMessages = await getValidationMessages(locale);
    const registerSchema = buildRegisterSchema(validationMessages);
    const result = registerSchema.safeParse(rawData);

    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { name, email, password } = result.data;

    await connectDB();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userToRegister = {
      name,
      email,
      passwordHash: hashedPassword,
    };

    const userRegistration = await registerUserRecord({
      rolePermission: ROLES.USER,
      user: userToRegister,
    });

    await createSession(userRegistration.user, userRegistration.permissions);

    redirect(`${getLocalizedPath(INDEX_URL, locale)}?toast=registrationSuccess`);
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT") {
      throw err;
    }

    const rawData = normalizeRegisterPayload(formData ?? prevState);
    const locale = rawData?.locale || DEFAULT_LOCALE;

    console.error("Error during registration:", err);
    return handleRegisterUserError({ error: err, locale });
  }
}
