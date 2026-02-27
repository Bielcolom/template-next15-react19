"use server";

import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { hasErrorCode } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import { createDataResponse } from "@/errors/responses";
import { createLocalizedDataErrorResponse } from "@/errors/serverResponses";
import { DEFAULT_LOCALE } from "@/utils/urls";

export async function getUserRoles(locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        const userRoles = await UserRole.find({}).lean();
        if (!userRoles || userRoles.length === 0) {
            return createDataResponse([]);
        }

        const serializedUserRoles = userRoles.map(role => ({
            ...role,
            _id: role._id.toString(),
        }));

        return createDataResponse(serializedUserRoles);
    } catch (error) {
        if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, [], locale);
        }
        if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, [], locale);
        }
        console.error("Error in getUserRoles function:", error);
        return createLocalizedDataErrorResponse(ERROR_CODES.FETCH_USER_ROLES_FAILED, [], locale);
    }
}

export async function getUserRoleById(userRoleId, locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        // Buscar el UserRole por su _id
        const userRole = await UserRole.findById(userRoleId).lean();

        if (!userRole) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
        }

        // Serializar el _id a string
        const serializedUserRole = {
            ...userRole,
            _id: userRole._id.toString(),
        };

        return createDataResponse(serializedUserRole);
    } catch (error) {
        if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, null, locale);
        }
        if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, null, locale);
        }
        console.error("Error in getUserRoleById function:", error);
        return createLocalizedDataErrorResponse(ERROR_CODES.FETCH_USER_ROLE_FAILED, null, locale);
    }
}
