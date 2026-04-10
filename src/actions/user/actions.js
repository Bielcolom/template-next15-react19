import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import UserRole from "../../models/UserRole.js";
import { ERROR_CODES } from "../../errors/codes.js";
import { connectDB } from "../../utils/connectDB.js";
import { DEFAULT_LOCALE } from "../../utils/urls.js";
import { createDataResponse } from "../../errors/responses.js";
import { handleUsersDataError } from "../../errors/handlers/userErrorHandler.js";
import { normalizePermissions } from "../../utils/helpers/index.js";
import { logger } from "../../utils/logger.js";

export const isValid = (user, requiredFields = []) => {
  if (!user) {
    return false;
  }

  return requiredFields.every((field) => Boolean(user[field]));
};

const findUserRoleById = async (userRoleId) => {
  if (!userRoleId) {
    return null;
  }

  return await UserRole.findById(userRoleId);
};

const isDuplicateKeyError = (error) => error?.code === 11000;

const createActionError = (code, message) => {
  const error = new Error(message || code);
  error.code = code;
  return error;
};

export async function createUser({
  user,
}) {
  await connectDB();

  if (!isValid(user, ["name", "email", "userRoleId", "passwordHash"])) {
    throw createActionError(ERROR_CODES.UNEXPECTED_ERROR, "Missing required user creation fields.");
  }

  try {
    return await User.create({
      name: user.name,
      email: user.email,
      userRoleId: user.userRoleId,
      passwordHash: user.passwordHash,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw createActionError(ERROR_CODES.EMAIL_ALREADY_REGISTERED);
    }
    throw error;
  }
}

export async function updateUser({
  userId,
  user,
}) {
  await connectDB();

  if (!userId || !user) {
    throw createActionError(ERROR_CODES.UNEXPECTED_ERROR, "Missing required user update fields.");
  }

  const updatePayload = {};

  if (typeof user.name !== "undefined") {
    updatePayload.name = user.name;
  }

  if (typeof user.userRoleId !== "undefined") {
    updatePayload.userRoleId = user.userRoleId;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw createActionError(ERROR_CODES.UNEXPECTED_ERROR, "No user fields to update.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    throw createActionError(ERROR_CODES.USER_NOT_FOUND);
  }

  return updatedUser;
}

export async function registerUser({
  rolePermission,
  user,
}) {
  await connectDB();

  if (!rolePermission || !isValid(user, ["name", "email", "passwordHash"])) {
    throw createActionError(ERROR_CODES.UNEXPECTED_ERROR, "Missing required user registration fields.");
  }

  const baseUserRole = await UserRole.findOne({ permissions: rolePermission });

  if (!baseUserRole) {
    throw createActionError(ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED);
  }

  const userToCreate = {
    ...user,
    userRoleId: baseUserRole._id,
  };

  const userCreation = await createUser({ user: userToCreate });

  return {
    user: userCreation,
    permissions: normalizePermissions(baseUserRole.permissions),
  };
}

export async function authenticateUser({
  user,
}) {
  await connectDB();

  if (!isValid(user, ["email", "password"])) {
    throw createActionError(ERROR_CODES.UNEXPECTED_ERROR, "Missing required login fields.");
  }

  const storedUser = await User.findOne({ email: user.email });

  if (!storedUser || !storedUser.passwordHash) {
    throw createActionError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isValidPassword = await bcrypt.compare(user.password, storedUser.passwordHash);
  if (!isValidPassword) {
    throw createActionError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const userRole = await findUserRoleById(storedUser.userRoleId);

  return {
    user: storedUser,
    permissions: normalizePermissions(userRole?.permissions),
  };
}

export async function findFiltered({
  userId,
  email,
  name,
} = {}) {
  await connectDB();

  const params = {};

  if (userId) {
    params._id = userId;
  }

  if (email) {
    params.email = email;
  }

  if (name) {
    params.name = name;
  }

  const users = await User.find(params).lean();
  return users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    userRoleId: user.userRoleId?.toString?.() || user.userRoleId,
  }));
}

export async function getUserCount(locale = DEFAULT_LOCALE) {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    return createDataResponse(userCount);
  } catch (error) {
    logger.error("Error in getUserCount function", error);
    return handleUsersDataError({ error, locale,  fallbackCode: ERROR_CODES.COUNT_USERS_FAILED});
  }
}
