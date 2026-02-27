"use server";

import { connectDB } from "@/utils/connectDB";
import User from "@/models/User";
import { requirePermission } from "@/app/lib/session";
import { ROLES } from "@/utils/constants";

const buildSuccess = (data) => ({ data, errors: [] });
const buildError = (fallbackData, message) => ({ data: fallbackData, errors: [message] });

export async function findFiltered(userId) {

    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const user = await User.findOne({ _id: userId }).lean();

        if (!user) {
            return buildError(null, "User not found.");
        }

        // Convertir ObjectId a string si es necesario
        const serializedUser = {
            ...user,
            _id: user._id.toString(),
            userRoleId: user?.userRoleId.toString(),
        };
        return buildSuccess(serializedUser);
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return buildError(null, "Authentication required.");
        }
        if (error?.message === "FORBIDDEN") {
            return buildError(null, "Insufficient permissions.");
        }
        console.error("Error in findFiltered function:", error);
        return buildError(null, "An error occurred while fetching the user.");
    }
}

export async function getUserCount() {
    try {
        await requirePermission([ROLES.ADMIN, ROLES.SUPERADMIN]);
        await connectDB();

        const userCount = await User.countDocuments();
        return buildSuccess(userCount);
    } catch (error) {
        if (error?.message === "UNAUTHORIZED") {
            return buildError(null, "Authentication required.");
        }
        if (error?.message === "FORBIDDEN") {
            return buildError(null, "Insufficient permissions.");
        }
        console.error("Error in getUserCount function:", error);
        return buildError(null, "An error occurred while counting users.");
    }
}
