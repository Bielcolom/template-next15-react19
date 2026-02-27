"use server";

import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";

export async function getUserRoles() {
    "use server";

    try {
        await requirePermission(ROLES.SUPERADMIN);
        await connectDB();

        const userRoles = await UserRole.find({}).lean();

        if (!userRoles || userRoles.length === 0) {
            return [];
        }

        const serializedUserRoles = userRoles.map(role => ({
            ...role,
            _id: role._id.toString(),
        }));

        return serializedUserRoles;
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return { elements: [], errors: ["Authentication required."] };
        }
        if (error?.message === "FORBIDDEN") {
            return { elements: [], errors: ["Insufficient permissions."] };
        }
        console.error("Error in getUserRoles function:", error);
        return { elements: [], errors: ["An error occurred while fetching user roles."] };
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
            return { userRole: null, errors: ["User role not found."] };
        }

        // Serializar el _id a string
        const serializedUserRole = {
            ...userRole,
            _id: userRole._id.toString(),
        };

        return serializedUserRole;
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return { userRole: null, errors: ["Authentication required."] };
        }
        if (error?.message === "FORBIDDEN") {
            return { userRole: null, errors: ["Insufficient permissions."] };
        }
        console.error("Error in getUserRoleById function:", error);
        return { userRole: null, errors: ["An error occurred while fetching the user role."] };
    }
}
