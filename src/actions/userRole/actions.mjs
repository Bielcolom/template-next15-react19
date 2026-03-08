const normalizePermissions = (permissions) => {
  if (Array.isArray(permissions)) {
    return permissions;
  }

  if (!permissions) {
    return [];
  }

  return [permissions];
};

const sanitizeRoleName = (name) => String(name || "").trim();

const sanitizeRolePermissions = (permissions) => [
  ...new Set(
    normalizePermissions(permissions)
      .map((permission) => String(permission).trim())
      .filter(Boolean)
  ),
];

const createRoleInStore = async (userRoleStore, payload) => {
  if (typeof userRoleStore.insertOne === "function") {
    const now = new Date();
    await userRoleStore.insertOne({
      ...payload,
      createdAt: now,
      updatedAt: now,
    });
    return await userRoleStore.findOne({ name: payload.name });
  }

  return await userRoleStore.create(payload);
};

const updateRoleInStore = async (userRoleStore, userRoleId, payload) => {
  if (
    typeof userRoleStore.insertOne === "function" &&
    typeof userRoleStore.updateOne === "function"
  ) {
    await userRoleStore.updateOne(
      { _id: userRoleId },
      {
        $set: {
          ...payload,
          updatedAt: new Date(),
        },
      }
    );
    return await userRoleStore.findOne({ _id: userRoleId });
  }

  return await userRoleStore.findByIdAndUpdate(
    userRoleId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );
};

export async function createUserRole({
  userRoleStore,
  name,
  permissions,
}) {
  if (!userRoleStore) {
    throw new Error("Missing user role store.");
  }

  const sanitizedName = sanitizeRoleName(name);
  const sanitizedPermissions = sanitizeRolePermissions(permissions);

  if (!sanitizedName || sanitizedPermissions.length === 0) {
    throw new Error("Missing required user role fields.");
  }

  const existingUserRole = await userRoleStore.findOne({ name: sanitizedName });
  if (existingUserRole) {
    return {
      status: "exists",
      userRole: existingUserRole,
    };
  }

  const createdUserRole = await createRoleInStore(userRoleStore, {
    name: sanitizedName,
    permissions: sanitizedPermissions,
  });

  return {
    status: "created",
    userRole: createdUserRole,
  };
}

export async function updateUserRole({
  userRoleStore,
  userRoleId,
  name,
  permissions,
}) {
  if (!userRoleStore || !userRoleId) {
    throw new Error("Missing required user role update fields.");
  }

  const updatePayload = {};

  if (typeof name !== "undefined") {
    const sanitizedName = sanitizeRoleName(name);
    if (!sanitizedName) {
      throw new Error("Invalid user role name.");
    }
    updatePayload.name = sanitizedName;
  }

  if (typeof permissions !== "undefined") {
    const sanitizedPermissions = sanitizeRolePermissions(permissions);
    if (sanitizedPermissions.length === 0) {
      throw new Error("Invalid user role permissions.");
    }
    updatePayload.permissions = sanitizedPermissions;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No user role fields to update.");
  }

  const updatedUserRole = await updateRoleInStore(userRoleStore, userRoleId, updatePayload);

  return {
    status: "updated",
    userRole: updatedUserRole,
  };
}
