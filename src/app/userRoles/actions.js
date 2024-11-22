"use server";

import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";

export async function getUserRoles() {
    "use server";

    try {
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
        console.error("Error in getUserRoles function:", error);
        return { elements: [], errors: ["An error occurred while fetching user roles."] };
    }
}

export async function getUserRoleById(userRoleId) {
    "use server";

    try {
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

        return { userRole: serializedUserRole, errors: [] };
    } catch (error) {
        console.error("Error in getUserRoleById function:", error);
        return { userRole: null, errors: ["An error occurred while fetching the user role."] };
    }
}
