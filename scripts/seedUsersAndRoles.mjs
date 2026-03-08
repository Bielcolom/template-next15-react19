import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

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
    email: "superadmin@boilerplate.local",
    roleName: "superadmin",
    passwordEnv: "SEED_SUPERADMIN_PASSWORD",
  },
  {
    name: "Admin",
    email: "admin@boilerplate.local",
    roleName: "admin",
    passwordEnv: "SEED_ADMIN_PASSWORD",
  },
  {
    name: "User",
    email: "user@boilerplate.local",
    roleName: "user",
    passwordEnv: "SEED_USER_PASSWORD",
  },
];

const DEFAULT_SEED_PASSWORD = "ChangeMe123!";

const toBoolean = (value) => String(value || "").toLowerCase() === "true";

const normalizeEnvValue = (rawValue) => {
  const value = rawValue.trim();
  const hasDoubleQuotes = value.startsWith("\"") && value.endsWith("\"");
  const hasSingleQuotes = value.startsWith("'") && value.endsWith("'");

  if (hasDoubleQuotes || hasSingleQuotes) {
    return value.slice(1, -1);
  }

  return value;
};

const loadDotEnv = () => {
  const envPath = path.resolve(process.cwd(), ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1);

    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }

    process.env[key] = normalizeEnvValue(rawValue);
  }
};

const splitMongoUri = (mongoUri) => {
  const questionMarkIndex = mongoUri.indexOf("?");
  const baseUri = questionMarkIndex === -1 ? mongoUri : mongoUri.slice(0, questionMarkIndex);
  const query = questionMarkIndex === -1 ? "" : mongoUri.slice(questionMarkIndex);
  const lastSlashIndex = baseUri.lastIndexOf("/");

  if (lastSlashIndex === -1) {
    return {
      adminUri: `${baseUri}/admin${query}`,
      requestedDatabaseName: "test",
    };
  }

  const requestedDatabaseName = baseUri.slice(lastSlashIndex + 1) || "test";
  const prefix = baseUri.slice(0, lastSlashIndex + 1);

  return {
    adminUri: `${prefix}admin${query}`,
    requestedDatabaseName,
  };
};

const resolveDatabaseName = async (requestedDatabaseName) => {
  const admin = mongoose.connection.db.admin();
  const databaseListResult = await admin.listDatabases();
  const databases = Array.isArray(databaseListResult?.databases) ? databaseListResult.databases : [];

  const existingWithDifferentCase = databases.find(
    (database) => database?.name?.toLowerCase() === requestedDatabaseName.toLowerCase()
  );

  if (!existingWithDifferentCase?.name) {
    return requestedDatabaseName;
  }

  if (existingWithDifferentCase.name !== requestedDatabaseName) {
    console.log(
      `database name case adjusted from "${requestedDatabaseName}" to "${existingWithDifferentCase.name}"`
    );
  }

  return existingWithDifferentCase.name;
};

const upsertRoles = async (userRolesCollection) => {
  const rolesByName = {};

  for (const role of roleSeeds) {
    const now = new Date();

    await userRolesCollection.updateOne(
      { name: role.name },
      {
        $set: {
          name: role.name,
          permissions: role.permissions,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );
    const persistedRole = await userRolesCollection.findOne({ name: role.name });

    rolesByName[role.name] = persistedRole;
    console.log(`role upserted: ${role.name}`);
  }

  return rolesByName;
};

const upsertUsers = async (usersCollection, rolesByName, updatePasswords) => {
  for (const seedUser of userSeeds) {
    const role = rolesByName[seedUser.roleName];

    if (!role?._id) {
      throw new Error(`Missing role "${seedUser.roleName}" for seeded user "${seedUser.email}"`);
    }

    const normalizedEmail = seedUser.email.trim().toLowerCase();
    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    const password = process.env[seedUser.passwordEnv] || DEFAULT_SEED_PASSWORD;
    const passwordHash = await bcrypt.hash(password, 10);

    if (!existingUser) {
      const now = new Date();
      await usersCollection.insertOne({
        name: seedUser.name,
        email: normalizedEmail,
        userRoleId: role._id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`user created: ${normalizedEmail}`);
      continue;
    }

    const update = {
      name: seedUser.name,
      userRoleId: role._id,
    };

    if (updatePasswords) {
      update.password = passwordHash;
    }

    await usersCollection.updateOne(
      { _id: existingUser._id },
      {
        $set: {
          ...update,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`user updated: ${normalizedEmail}`);
  }
};

const main = async () => {
  loadDotEnv();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required to run seeds.");
  }

  const updatePasswords = toBoolean(process.env.SEED_UPDATE_PASSWORDS);
  const { adminUri, requestedDatabaseName } = splitMongoUri(mongoUri);

  await mongoose.connect(adminUri, { bufferCommands: false });

  try {
    const databaseName = await resolveDatabaseName(requestedDatabaseName);
    const database = mongoose.connection.useDb(databaseName, { useCache: true }).db;
    const userRolesCollection = database.collection("userroles");
    const usersCollection = database.collection("users");

    const rolesByName = await upsertRoles(userRolesCollection);
    await upsertUsers(usersCollection, rolesByName, updatePasswords);
  } finally {
    await mongoose.disconnect();
  }

  console.log("seeding completed");

  if (!updatePasswords) {
    console.log("passwords for existing seeded users were not changed");
  }
};

main().catch((error) => {
  console.error("seed failed:", error.message || error);
  process.exitCode = 1;
});
