import "server-only";
import User from "@/models/User";
import UserRole from "@/models/UserRole";
import { connectDB } from "@/utils/connectDB";
import { normalizePermissions } from "@/utils/helpers";
import { deleteRedisKey, getRedisJson, setRedisJson } from "@/utils/redis";
import { AppError } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";

const DEFAULT_PERMISSIONS_CACHE_TTL_SECONDS = 5 * 60;
const rawPermissionsCacheTtl = Number(process.env.REDIS_PERMISSIONS_TTL_SECONDS || DEFAULT_PERMISSIONS_CACHE_TTL_SECONDS);
const PERMISSIONS_CACHE_TTL_SECONDS = Number.isFinite(rawPermissionsCacheTtl) && rawPermissionsCacheTtl > 0
? rawPermissionsCacheTtl
  : DEFAULT_PERMISSIONS_CACHE_TTL_SECONDS;
const PERMISSIONS_CACHE_PREFIX = "auth:permissions";

export const getPermissionsCacheKey = (userId) => `${PERMISSIONS_CACHE_PREFIX}:${userId}`;

export async function cacheUserPermissions(userId, permissions) {
  if (!userId) {
    return false;
  }

  return setRedisJson(
    getPermissionsCacheKey(userId),
    normalizePermissions(permissions),
    PERMISSIONS_CACHE_TTL_SECONDS
  );
}

export async function deleteCachedUserPermissions(userId) {
  if (!userId) {
    return false;
  }

  return deleteRedisKey(getPermissionsCacheKey(userId));
}

export async function invalidatePermissionsCacheForUsers(userIds = []) {
  const validUserIds = [...new Set(userIds.filter(Boolean))];

  if (validUserIds.length === 0) {
    return 0;
  }

  await Promise.all(validUserIds.map((userId) => deleteCachedUserPermissions(userId)));
  return validUserIds.length;
}

export async function invalidatePermissionsCacheForRole(userRoleId) {
  if (!userRoleId) {
    return 0;
  }

  await connectDB();
  const users = await User.find({ userRoleId }).select("_id").lean();
  const userIds = users.map((user) => user?._id?.toString()).filter(Boolean);

  return invalidatePermissionsCacheForUsers(userIds);
}

export async function getCurrentPermissionsFromDB(userId) {
  await connectDB();

  const user = await User.findById(userId).select("userRoleId").lean();
  if (!user?.userRoleId) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  const userRole = await UserRole.findById(user.userRoleId).select("permissions").lean();
  if (!userRole) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED);
  }

  return normalizePermissions(userRole.permissions);
}

export async function refreshPermissionsCacheForUser(userId) {
  const currentPermissions = await getCurrentPermissionsFromDB(userId);
  await cacheUserPermissions(userId, currentPermissions);
  return currentPermissions;
}

export async function getCurrentPermissions(userId) {
  const cachedPermissions = await getRedisJson(getPermissionsCacheKey(userId));
  if (Array.isArray(cachedPermissions)) {
    return normalizePermissions(cachedPermissions);
  }

  return refreshPermissionsCacheForUser(userId);
}
