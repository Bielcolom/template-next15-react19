"use server";

import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { logger } from "@/utils/logger";
import { ERROR_CODES } from "@/errors/codes";
import { createDataResponse } from "@/errors/responses";
import { handleUsersDataError } from "@/errors/handlers/userErrorHandler";
import { DEFAULT_LOCALE } from "@/utils/urls";

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
