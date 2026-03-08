"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { registerUser as registerUserRecord } from "@/actions/user/actions.mjs";
import { connectDB } from "@/utils/connectDB";
import { createSession } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { DEFAULT_LOCALE, INDEX_URL, getLocalizedPath } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { getValidationMessages } from "@/errors/i18n";
import { createLocalizedFieldErrorResponse } from "@/errors/serverResponses";

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

    if (userRegistration.status === "missing_default_role") {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED, locale);
    }

    if (userRegistration.status === "exists") {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.EMAIL_ALREADY_REGISTERED, locale);
    }

    await createSession(userRegistration.user, userRegistration.permissions);

    redirect(`${getLocalizedPath(INDEX_URL, locale)}?toast=registrationSuccess`);
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT") {
      throw err;
    }

    console.error("Error during registration:", err);
    const rawData = normalizeRegisterPayload(formData ?? prevState);
    return createLocalizedFieldErrorResponse(
      "email",
      ERROR_CODES.REGISTRATION_FAILED,
      rawData?.locale || DEFAULT_LOCALE
    );
  }
}
