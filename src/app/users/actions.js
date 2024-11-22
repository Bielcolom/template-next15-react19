import { connectDB } from "@/utils/connectDB";
import User from "@/models/User";

export async function findFiltered(userId) {
    "use server";

    try {
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
        console.error("Error in findFiltered function:", error);
        return { user: null, errors: ["An error occurred while fetching the user."] };
    }
}