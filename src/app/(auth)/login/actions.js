"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { createSession, deleteSession } from "@/app/lib/session";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { normalizePermissions } from "@/utils/helpers";
import { DEFAULT_LOCALE } from "@/utils/urls";
import { ERROR_CODES } from "@/errors/codes";
import { getValidationMessages } from "@/errors/i18n";
import {
  createLocalizedFieldErrorResponse,
  createLocalizedGeneralErrorResponse,
} from "@/errors/serverResponses";

const buildLoginSchema = (validationMessages) => z.object({
  email: z.string().email({ message: validationMessages.INVALID_EMAIL }).trim(),
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

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.INVALID_CREDENTIALS, locale);
    }

    const formattedUser = {
      ...user.toObject(),
      _id: user._id.toString(),
    };

    const userRole = await UserRole.findById(user.userRoleId).lean();
    const permissions = normalizePermissions(userRole?.permissions);

    const sessionCreation = await createSession(formattedUser, permissions);
    if (!sessionCreation) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.SESSION_CREATION_FAILED, locale);
    }

    return { success: true, userId: formattedUser?._id };
  } catch (error) {
    console.error("Error in login function:", error);
    const rawData = normalizeLoginPayload(formData ?? prevState);
    return createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, rawData?.locale || DEFAULT_LOCALE);
  }
}

export async function logout() {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Error in logout function:", error);
    return createLocalizedGeneralErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, DEFAULT_LOCALE);
  }
}
