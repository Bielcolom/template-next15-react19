import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { createUser as createUserRecord } from "../src/actions/user/actions.mjs";
import { createUserRole as createUserRoleRecord } from "../src/actions/userRole/actions.mjs";
import { ERROR_CODES } from "../src/errors/codes.js";
import UserRole from "../src/models/UserRole.js";

const ROLES = {
  USER: "user_access",
  ADMIN: "admin_access",
  SUPERADMIN: "superadmin_access",
};

const roleSeeds = [
  {
    name: "user",
    permissions: [ROLES.USER],
  },
  {
    name: "admin",
    permissions: [ROLES.ADMIN, ROLES.USER],
  },
  {
    name: "superadmin",
    permissions: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.USER],
  },
];

const userSeeds = [
  {
    name: "Super Admin",
    email: "superadmin@template.local",
    roleName: "superadmin",
    passwordEnv: "SEED_SUPERADMIN_PASSWORD",
  },
  {
    name: "Admin",
    email: "admin@template.local",
    roleName: "admin",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    name: "User",
    email: "user@template.local",
    roleName: "user",
    passwordEnv: "SEED_USER_PASSWORD",
  },
];

const DEFAULT_SEED_PASSWORD = "ChangeMe123!";

const upsertRoles = async (userRoleStore) => {
  const rolesByName = {};

  for (const role of roleSeeds) {
    const createResult = await createUserRoleRecord({
      userRoleStore,
      name: role.name,
      permissions: role.permissions,
    });

    if (createResult.status === "created") {
      rolesByName[role.name] = createResult.userRole;
      console.log(`role created: ${role.name}`);
      continue;
    }

    rolesByName[role.name] = createResult.userRole;
    console.log(`role already exists (skipped): ${role.name}`);
  }

  return rolesByName;
};

const upsertUsers = async (rolesByName) => {
  for (const seedUser of userSeeds) {
    const role = rolesByName[seedUser.roleName];

    if (!role?._id) {
      throw new Error(`Missing role "${seedUser.roleName}" for seeded user "${seedUser.email}"`);
    }
    const password = process.env[seedUser.passwordEnv] || DEFAULT_SEED_PASSWORD;
    const passwordHash = await bcrypt.hash(password, 10);
    const userToCreate = {
      name: seedUser.name,
      email: seedUser.email,
      userRoleId: role._id,
      passwordHash,
    };

    try {
      await createUserRecord({
        user: userToCreate,
      });
      console.log(`user created: ${seedUser.email}`);
    } catch (error) {
      if (error?.code === ERROR_CODES.EMAIL_ALREADY_REGISTERED) {
        console.log(`user already exists (skipped): ${seedUser.email}`);
        continue;
      }
      throw error;
    }
  }
};

const main = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to run seeds.");
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });

  try {
    const rolesByName = await upsertRoles(UserRole);
    await upsertUsers(rolesByName);
  } finally {
    await mongoose.disconnect();
  }

  console.log("seeding completed");
};

main().catch((error) => {
  console.error("seed failed:", error.message || error);
  process.exitCode = 1;
});
