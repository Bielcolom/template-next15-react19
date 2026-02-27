"use server";

import { connectDB } from "@/utils/connectDB";
import User from "@/models/User";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";

export async function findFiltered(userId) {

    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const user = await User.findOne({ _id: userId }).lean();

        if (!user) {
            return { user: null, errors: ["User not found."] };
        }

        // Convertir ObjectId a string si es necesario
        const serializedUser = {
            ...user,
            _id: user._id.toString(),
            userRoleId: user?.userRoleId.toString(),
        };
        return serializedUser;
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return { user: null, errors: ["Authentication required."] };
        }
        if (error?.message === "FORBIDDEN") {
            return { user: null, errors: ["Insufficient permissions."] };
        }
        console.error("Error in findFiltered function:", error);
        return { user: null, errors: ["An error occurred while fetching the user."] };
    }
}

export async function getUserCount() {
    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const userCount = await User.countDocuments();
        return userCount;
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return { count: null, errors: ["Authentication required."] };
        }
        if (error?.message === "FORBIDDEN") {
            return { count: null, errors: ["Insufficient permissions."] };
        }
        console.error("Error in getUserCount function:", error);
        return { count: null, errors: ["An error occurred while counting users."] };
    }
}
