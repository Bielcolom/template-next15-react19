"use server";

import { z } from "zod";
import { createSession, deleteSession } from "@/app/lib/session";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { normalizePermissions } from "@/utils/helpers";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(formData) {
  try {
    // Validate formData using the schema
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return {
        errors: result.error.flatten().fieldErrors,
      };
    }

    const { email, password } = result.data;

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        errors: {
          email: ["Invalid email or password"],
        },
      };
    }

    const formattedUser = {
      ...user.toObject(),
      _id: user._id.toString(),
    };

    const userRole = await UserRole.findById(user.userRoleId).lean();
    const permissions = normalizePermissions(userRole?.permissions);

    const sessionCreation = await createSession(formattedUser, permissions);
    if (!sessionCreation) {
      return {
        errors: {
          email: ["Failed to create session. Please try again."],
        },
      };
    }

    return { success: true, userId: formattedUser?._id };

  } catch (error) {
    console.error("Error in login function:", error);
    return {
      errors: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}

export async function logout() {
  try {
    await deleteSession();
  } catch (error) {
    console.error("Error in logout function:", error);
    return {
      errors: {
        general: ["An unexpected error occurred. Please try again."],
      },
    };
  }
}
