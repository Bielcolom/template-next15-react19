"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { createSession } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { INDEX_URL } from "@/utils/urls";
import { DEFAULT_LOCALE } from "@/utils/urls";
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
    .email({ message: validationMessages.INVALID_EMAIL })
    .trim(),
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

export async function register(prevState, formData) {
  const rawData = Object.fromEntries(formData);
  const locale = rawData.locale || DEFAULT_LOCALE;
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

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.EMAIL_ALREADY_REGISTERED, locale);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const baseUserRole = await UserRole.findOne({
      permissions: ROLES.USER,
    }).lean();

    if (!baseUserRole) {
      return createLocalizedFieldErrorResponse("email", ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED, locale);
    }

    const user = new User({
      name,
      userRoleId: baseUserRole._id,
      email,
      password: hashedPassword,
    });

    await user.save();

    const formattedUser = {
      ...user.toObject(),
      _id: user._id.toString(),
    };

    await createSession(formattedUser, [ROLES.USER]);

    redirect(INDEX_URL);
  } catch (err) {
    if (err?.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Error during registration:", err);
    return createLocalizedFieldErrorResponse("email", ERROR_CODES.REGISTRATION_FAILED, locale);
  }
}
