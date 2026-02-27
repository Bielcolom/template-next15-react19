"use server";

import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";

const buildSuccess = (data) => ({ data, errors: [] });
const buildError = (fallbackData, message) => ({ data: fallbackData, errors: [message] });

export async function getUserRoles() {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        const userRoles = await UserRole.find({}).lean();
        if (!userRoles || userRoles.length === 0) {
            return buildSuccess([]);
        }

        const serializedUserRoles = userRoles.map(role => ({
            ...role,
            _id: role._id.toString(),
        }));

        return buildSuccess(serializedUserRoles);
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return buildError([], "Authentication required.");
        }
        if (error?.message === "FORBIDDEN") {
            return buildError([], "Insufficient permissions.");
        }
        console.error("Error in getUserRoles function:", error);
        return buildError([], "An error occurred while fetching user roles.");
    }
}

export async function getUserRoleById(userRoleId) {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        // Buscar el UserRole por su _id
        const userRole = await UserRole.findById(userRoleId).lean();

        if (!userRole) {
            return buildError(null, "User role not found.");
        }

        // Serializar el _id a string
        const serializedUserRole = {
            ...userRole,
            _id: userRole._id.toString(),
        };

        return buildSuccess(serializedUserRole);
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return buildError(null, "Authentication required.");
        }
        if (error?.message === "FORBIDDEN") {
            return buildError(null, "Insufficient permissions.");
        }
        console.error("Error in getUserRoleById function:", error);
        return buildError(null, "An error occurred while fetching the user role.");
    }
}
