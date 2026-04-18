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

const serializeUser = (user, roleNameMap) => ({
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: roleNameMap[user.userRoleId?.toString()] ?? "",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export async function getUsers(locale = DEFAULT_LOCALE) {
    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const [users, userRoles] = await Promise.all([
            User.find({}).lean(),
            UserRole.find({}).lean(),
        ]);

        const roleNameMap = Object.fromEntries(
            userRoles.map((role) => [role._id.toString(), role.name])
        );

        return createDataResponse(users.map((user) => serializeUser(user, roleNameMap)));
    } catch (error) {
        logger.error("Error in getUsers function", error);
        return handleUsersDataError({
            error,
            locale,
            fallbackCode: ERROR_CODES.FETCH_USER_FAILED,
            fallbackData: [],
        });
    }
}
