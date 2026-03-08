import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import UserRole from "../../models/UserRole.js";

export const isValid = (user, requiredFields = []) => {
  if (!user) {
    return false;
  }

  return requiredFields.every((field) => Boolean(user[field]));
};

const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return permissions.filter(Boolean);
  }

  if (!permissions) {
    return [];
  }

  return [permissions].filter(Boolean);
};

const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const userData = typeof user.toObject === "function" ? user.toObject() : user;
  const userId = user?._id ?? userData?._id;

  return {
    ...userData,
    _id: typeof userId?.toString === "function" ? userId.toString() : userId,
  };
};

const findUserRoleById = async (userRoleId) => {
  if (!userRoleId) {
    return null;
  }

  return await UserRole.findById(userRoleId);
};

export async function createUser({
  user,
}) {
  if (!isValid(user, ["name", "email", "userRoleId", "passwordHash"])) {
    throw new Error("Missing required user creation fields.");
  }

  const existingUser = await User.findOne({ email: user.email });

  if (existingUser) {
    return {
      status: "exists",
      user: existingUser,
    };
  }

  const createdUser = await User.create({
    name: user.name,
    email: user.email,
    userRoleId: user.userRoleId,
    password: user.passwordHash,
  });

  return {
    status: "created",
    user: createdUser,
  };
}

export async function updateUser({
  userId,
  user,
}) {
  if (!userId || !user) {
    throw new Error("Missing required user update fields.");
  }

  const updatePayload = {};

  if (typeof user.name !== "undefined") {
    updatePayload.name = user.name;
  }

  if (typeof user.userRoleId !== "undefined") {
    updatePayload.userRoleId = user.userRoleId;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No user fields to update.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );

  return {
    status: "updated",
    user: updatedUser,
  };
}

export async function registerUser({
  rolePermission,
  user,
}) {
  if (!rolePermission || !isValid(user, ["name", "email", "passwordHash"])) {
    throw new Error("Missing required user registration fields.");
  }

  const baseUserRole = await UserRole.findOne({
    permissions: rolePermission,
  });

  if (!baseUserRole) {
    return {
      status: "missing_default_role",
    };
  }

  const userToCreate = {
    ...user,
    userRoleId: baseUserRole._id,
  };

  const userCreation = await createUser({ user: userToCreate });

  if (userCreation.status === "exists") {
    return userCreation;
  }

  return {
    status: "created",
    user: serializeUser(userCreation.user),
    permissions: normalizePermissions(baseUserRole.permissions),
  };
}

export async function authenticateUser({
  user,
}) {
  if (!isValid(user, ["email", "password"])) {
    throw new Error("Missing required login fields.");
  }

  const storedUser = await User.findOne({ email: user.email });

  if (!storedUser || !storedUser.password) {
    return {
      status: "invalid_credentials",
    };
  }

  const isValidPassword = await bcrypt.compare(user.password, storedUser.password);
  if (!isValidPassword) {
    return {
      status: "invalid_credentials",
    };
  }

  const userRole = await findUserRoleById(storedUser.userRoleId);

  return {
    status: "authenticated",
    user: serializeUser(storedUser),
    permissions: normalizePermissions(userRole?.permissions),
  };
}
