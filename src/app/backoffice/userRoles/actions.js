"use server";

import UserRole from "@/models/UserRole";
import {
    createUserRole as createUserRoleRecord,
    updateUserRole as updateUserRoleRecord,
} from "@/actions/userRole/actions.mjs";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";
import { normalizeFormPayload, normalizePermissions } from "@/utils/helpers";
import { ERROR_CODES } from "@/errors/codes";
import { createDataResponse } from "@/errors/responses";
import { createLocalizedDataErrorResponse } from "@/errors/serverResponses";
import { handleUserRolesDataError } from "@/errors/handlers/userRoleErrorHandler";
import { invalidatePermissionsCacheForRole } from "@/app/lib/permissionCache";
import { DEFAULT_LOCALE } from "@/utils/urls";

const sanitizeRoleInput = (payload) => {
    const rawData = normalizeFormPayload(payload);
    const name = typeof rawData?.name === "string" ? rawData.name.trim() : "";
    const permissions = [
        ...new Set(
            normalizePermissions(rawData?.permissions)
                .map((permission) => String(permission).trim())
                .filter(Boolean)
        ),
    ];

    return {
        name,
        permissions,
    };
};

const serializeUserRole = (userRole) => ({
    ...userRole,
    _id: userRole._id.toString(),
});

export async function getUserRoles(locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        const userRoles = await UserRole.find({}).lean();
        if (!userRoles || userRoles.length === 0) {
            return createDataResponse([]);
        }

        const serializedUserRoles = userRoles.map((role) => serializeUserRole(role));

        return createDataResponse(serializedUserRoles);
    } catch (error) {
        console.error("Error in getUserRoles function:", error);
        return handleUserRolesDataError({
            error,
            locale,
            fallbackCode: ERROR_CODES.FETCH_USER_ROLES_FAILED,
            fallbackData: [],
        });
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

        return createDataResponse(serializeUserRole(userRole));
    } catch (error) {
        console.error("Error in getUserRoleById function:", error);
        return handleUserRolesDataError({ error, locale });
    }
}

export async function createUserRole(payload, locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        const { name, permissions } = sanitizeRoleInput(payload);
        if (!name || permissions.length === 0) {
            return createLocalizedDataErrorResponse(ERROR_CODES.INVALID_USER_ROLE_DATA, null, locale);
        }

        const userRoleCreation = await createUserRoleRecord({
            userRoleStore: UserRole,
            name,
            permissions,
        });
        if (userRoleCreation.status === "exists") {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_ALREADY_EXISTS, null, locale);
        }

        const userRole = typeof userRoleCreation.userRole?.toObject === "function"
            ? userRoleCreation.userRole.toObject()
            : userRoleCreation.userRole;

        return createDataResponse(serializeUserRole(userRole));
    } catch (error) {
        console.error("Error in createUserRole function:", error);
        return handleUserRolesDataError({ error, locale });
    }
}

export async function updateUserRole(userRoleId, payload, locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        if (!userRoleId) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
        }

        const { name, permissions } = sanitizeRoleInput(payload);
        if (!name || permissions.length === 0) {
            return createLocalizedDataErrorResponse(ERROR_CODES.INVALID_USER_ROLE_DATA, null, locale);
        }

        const userRoleUpdate = await updateUserRoleRecord({
            userRoleStore: UserRole,
            userRoleId,
            name,
            permissions,
        });
        const updatedUserRole = typeof userRoleUpdate.userRole?.toObject === "function"
            ? userRoleUpdate.userRole.toObject()
            : userRoleUpdate.userRole;

        if (!updatedUserRole) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
        }

        await invalidatePermissionsCacheForRole(userRoleId);

        return createDataResponse(serializeUserRole(updatedUserRole));
    } catch (error) {
        console.error("Error in updateUserRole function:", error);
        return handleUserRolesDataError({ error, locale });
    }
}

export async function deleteUserRole(userRoleId, locale = DEFAULT_LOCALE) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        if (!userRoleId) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
        }

        const deletedUserRole = await UserRole.findByIdAndDelete(userRoleId).lean();
        if (!deletedUserRole) {
            return createLocalizedDataErrorResponse(ERROR_CODES.USER_ROLE_NOT_FOUND, null, locale);
        }

        await invalidatePermissionsCacheForRole(userRoleId);

        return createDataResponse({
            _id: deletedUserRole._id.toString(),
            deleted: true,
        });
    } catch (error) {
        console.error("Error in deleteUserRole function:", error);
        return handleUserRolesDataError({ error, locale });
    }
}
