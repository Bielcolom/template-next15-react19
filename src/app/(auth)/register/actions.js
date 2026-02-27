"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { createSession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { ROLES } from "@/utils/constants";

const registerSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
  confirmPassword: z
    .string()
    .min(8, { message: "Password confirmation must be at least 8 characters" })
    .trim(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function register(prevState, formData) {
  // Validar los datos del formulario usando el esquema
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, confirmPassword } = result.data;

  // Verificar si las contraseñas coinciden
  if (password !== confirmPassword) {
    return {
      errors: {
        confirmPassword: ["Passwords do not match"],
      },
    };
  }

  // Conectar a la base de datos
  await connectDB();

  try {
    // Verificar si ya existe un usuario con ese correo electrónico
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        errors: {
          email: ["Email is already registered"],
        },
      };
    }

    // Hashear la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const baseUserRole = await UserRole.findOne({
      permissions: ROLES.USER,
    }).lean();

    if (!baseUserRole) {
      return {
        errors: {
          email: ["Default user role is not configured."],
        },
      };
    }

    // Crear el nuevo usuario en la base de datos
    const user = new User({
      name,
      userRoleId: baseUserRole._id,
      email,
      password: hashedPassword,
    });

    await user.save();

    const formattedUser = {
      ...user.toObject(),
      _id: user._id.toString(),
    };

    // Crear una sesión para el usuario recién registrado
    await createSession(formattedUser, [ROLES.USER]);

    // Redirigir al dashboard después del registro
    redirect("/");

  } catch (err) {
    if (err?.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.error("Error during registration:", err);
    return {
      errors: {
        email: ["An error occurred. Please try again later."],
      },
    };
  }
}
