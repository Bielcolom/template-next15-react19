"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { logger } from "@/utils/logger";
import { ERROR_CODES } from "@/errors/codes";
import { createDataResponse } from "@/errors/responses";
import { createLocalizedDataErrorResponse } from "@/errors/serverResponses";
import { handleUsersDataError } from "@/errors/handlers/userErrorHandler";
import { DEFAULT_LOCALE, REGISTER_URL } from "@/utils/urls";
import { sendEmail } from "@/lib/email";
import { invitationEmailTemplate } from "@/emails/invitationEmail";

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  roleName: z.string().min(1),
  requireChangePassword: z.boolean().default(true),
});

const inviteSchema = z.object({
  emails: z.array(z.string().email()).min(1),
  roleName: z.string().min(1),
});

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const roleVariant = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("super")) return "dark";
  if (n.includes("admin")) return "danger";
  if (n.includes("edit")) return "primary";
  return "neutral";
};

const serializeUser = (user, roleNameMap) => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: roleNameMap[user.userRoleId?.toString()] ?? "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export async function getUsers(locale = DEFAULT_LOCALE, { page = 1, pageSize = 10, query = "", role = "" } = {}) {
  try {
    await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
    await connectDB();

    const skip = (page - 1) * pageSize;
    const normalizedQuery = typeof query === "string" ? query.trim() : "";
    const normalizedRole = typeof role === "string" ? role.trim() : "";

    const userRoles = await UserRole.find({}).lean();
    const roleNameMap = Object.fromEntries(
      userRoles.map((r) => [r._id.toString(), r.name])
    );

    const filters = {};

    if (normalizedQuery) {
      filters.$or = [
        { name: { $regex: escapeRegex(normalizedQuery), $options: "i" } },
        { email: { $regex: escapeRegex(normalizedQuery), $options: "i" } },
      ];
    }

    if (normalizedRole) {
      const matchingRole = userRoles.find((r) => r.name === normalizedRole);
      if (matchingRole) {
        filters.userRoleId = matchingRole._id;
      }
    }

    const [users, total] = await Promise.all([
      User.find(filters).skip(skip).limit(pageSize).lean(),
      User.countDocuments(filters),
    ]);

    return createDataResponse({
      users: users.map((user) => serializeUser(user, roleNameMap)),
      total,
    });
  } catch (error) {
    logger.error("Error in getUsers function", error);
    return handleUsersDataError({
      error,
      locale,
      fallbackCode: ERROR_CODES.FETCH_USER_FAILED,
      fallbackData: { users: [], total: 0 },
    });
  }
}

export async function getRoles() {
  try {
    await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
    await connectDB();

    const roles = await UserRole.find({}).lean();

    return createDataResponse({
      roles: roles.map((r) => ({
        value: r.name,
        label: r.name,
        variant: roleVariant(r.name),
      })),
    });
  } catch (error) {
    logger.error("Error in getRoles function", error);
    return handleUsersDataError({
      error,
      fallbackCode: ERROR_CODES.FETCH_USER_FAILED,
      fallbackData: { roles: [] },
    });
  }
}

export async function adminCreateUser(locale = DEFAULT_LOCALE, payload) {
  try {
    await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);

    const parsed = createUserSchema.safeParse(payload);
    if (!parsed.success) {
      return createLocalizedDataErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, null, locale);
    }

    const { name, email, password, roleName, requireChangePassword } = parsed.data;

    await connectDB();

    const role = await UserRole.findOne({ name: roleName }).lean();
    if (!role) {
      return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      userRoleId: role._id,
      requireChangePassword,
    });

    return createDataResponse({ _id: user._id.toString(), name: user.name, email: user.email });
  } catch (error) {
    logger.error("Error in adminCreateUser function", error);
    if (error?.code === 11000) {
      return createLocalizedDataErrorResponse(ERROR_CODES.EMAIL_ALREADY_REGISTERED, null, locale);
    }
    return handleUsersDataError({
      error,
      locale,
      fallbackCode: ERROR_CODES.UNEXPECTED_ERROR,
      fallbackData: null,
    });
  }
}

export async function sendUserInvitations(locale = DEFAULT_LOCALE, payload) {
  try {
    await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);

    const parsed = inviteSchema.safeParse(payload);
    if (!parsed.success) {
      return createLocalizedDataErrorResponse(ERROR_CODES.UNEXPECTED_ERROR, null, locale);
    }

    const { emails, roleName } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const inviteUrl = `${appUrl}/${locale}${REGISTER_URL}`;
    const brandName = process.env.NEXT_PUBLIC_BRAND_NAME ?? "Wozzo";

    const results = await Promise.allSettled(
      emails.map(async (email) => {
        const { subject, html } = invitationEmailTemplate({ inviteUrl, roleName, brandName, locale });
        await sendEmail({ to: email, subject, html });
        return email;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
    const failed = results.filter((r) => r.status === "rejected").map((_, i) => emails[i]);

    return createDataResponse({ sent, failed });
  } catch (error) {
    logger.error("Error in sendUserInvitations function", error);
    return handleUsersDataError({
      error,
      locale,
      fallbackCode: ERROR_CODES.UNEXPECTED_ERROR,
      fallbackData: { sent: [], failed: [] },
    });
  }
}
