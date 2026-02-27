"use server";

import { connectDB } from "@/utils/connectDB";
import User from "@/models/User";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { hasErrorCode } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";
import { createDataResponse } from "@/errors/responses";
import { createLocalizedDataErrorResponse } from "@/errors/serverResponses";
import { DEFAULT_LOCALE } from "@/utils/urls";

export async function findFiltered(userId, locale = DEFAULT_LOCALE) {

    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const user = await User.findOne({ _id: userId }).lean();

        if (!user) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_NOT_FOUND, null, locale);
        }

        // Convertir ObjectId a string si es necesario
        const serializedUser = {
            ...user,
            _id: user._id.toString(),
            userRoleId: user?.userRoleId.toString(),
        };
        return createDataResponse(serializedUser);
    } catch (error) {
        if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, null, locale);
        }
        if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, null, locale);
        }
        console.error("Error in findFiltered function:", error);
        return createLocalizedDataErrorResponse(ERROR_CODES.FETCH_USER_FAILED, null, locale);
    }
}

export async function getUserCount(locale = DEFAULT_LOCALE) {
    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const userCount = await User.countDocuments();
        return createDataResponse(userCount);
    } catch (error) {
        if (hasErrorCode(error, ERROR_CODES.UNAUTHORIZED)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.UNAUTHORIZED, null, locale);
        }
        if (hasErrorCode(error, ERROR_CODES.FORBIDDEN)) {
            return createLocalizedDataErrorResponse(ERROR_CODES.FORBIDDEN, null, locale);
        }
        console.error("Error in getUserCount function:", error);
        return createLocalizedDataErrorResponse(ERROR_CODES.COUNT_USERS_FAILED, null, locale);
    }
}
