import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/utils/constants";

const mocks = vi.hoisted(() => ({
  requirePermissionMock: vi.fn(),
  connectDBMock: vi.fn(),
  userRoleFindMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
  userRoleCreateMock: vi.fn(),
  userRoleFindByIdAndUpdateMock: vi.fn(),
  userRoleFindByIdAndDeleteMock: vi.fn(),
  invalidatePermissionsCacheForRoleMock: vi.fn(),
}));

vi.mock("@/app/lib/session", () => ({
  requirePermission: mocks.requirePermissionMock,
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/app/lib/permissionCache", () => ({
  invalidatePermissionsCacheForRole: mocks.invalidatePermissionsCacheForRoleMock,
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    find: mocks.userRoleFindMock,
    findById: mocks.userRoleFindByIdMock,
    create: mocks.userRoleCreateMock,
    findByIdAndUpdate: mocks.userRoleFindByIdAndUpdateMock,
    findByIdAndDelete: mocks.userRoleFindByIdAndDeleteMock,
  },
}));

import {
  createUserRole,
  deleteUserRole,
  getUserRoleById,
  getUserRoles,
  updateUserRole,
} from "./actions";

describe("backoffice userRoles actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getUserRoles returns serialized roles", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleFindMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([
        {
          _id: { toString: () => "role-1" },
          name: "Admin",
          permissions: ["admin_access"],
        },
      ]),
    });

    const result = await getUserRoles("en");

    expect(mocks.requirePermissionMock).toHaveBeenCalledWith(ROLES.SUPERADMIN);
    expect(result).toEqual({
      data: [
        {
          _id: "role-1",
          name: "Admin",
          permissions: ["admin_access"],
        },
      ],
      errors: [],
    });
  });

  it("getUserRoles returns auth error when unauthorized", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("UNAUTHORIZED"));

    const result = await getUserRoles("en");

    expect(result).toEqual({
      data: [],
      errors: ["Authentication required."],
    });
  });

  it("getUserRoleById returns not found error", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleFindByIdMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null),
    });

    const result = await getUserRoleById("missing", "en");

    expect(result).toEqual({
      data: null,
      errors: ["User role not found."],
    });
  });

  it("getUserRoleById returns permission error when forbidden", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("FORBIDDEN"));

    const result = await getUserRoleById("role-1", "en");

    expect(result).toEqual({
      data: null,
      errors: ["Insufficient permissions."],
    });
  });

  it("createUserRole creates and serializes a role", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleCreateMock.mockResolvedValueOnce({
      toObject: () => ({
        _id: { toString: () => "role-2" },
        name: "Manager",
        permissions: ["admin_access", "user_access"],
      }),
    });

    const result = await createUserRole(
      { name: "  Manager  ", permissions: ["admin_access", "user_access"] },
      "en"
    );

    expect(mocks.userRoleCreateMock).toHaveBeenCalledWith({
      name: "Manager",
      permissions: ["admin_access", "user_access"],
    });
    expect(result).toEqual({
      data: {
        _id: "role-2",
        name: "Manager",
        permissions: ["admin_access", "user_access"],
      },
      errors: [],
    });
  });

  it("updateUserRole updates role and invalidates permissions cache", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleFindByIdAndUpdateMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: { toString: () => "role-1" },
        name: "Admin",
        permissions: ["admin_access", "user_access"],
      }),
    });
    mocks.invalidatePermissionsCacheForRoleMock.mockResolvedValueOnce(2);

    const result = await updateUserRole(
      "role-1",
      { name: "  Admin  ", permissions: ["admin_access", "user_access"] },
      "en"
    );

    expect(mocks.userRoleFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "role-1",
      {
        name: "Admin",
        permissions: ["admin_access", "user_access"],
      },
      {
        new: true,
        runValidators: true,
      }
    );
    expect(mocks.invalidatePermissionsCacheForRoleMock).toHaveBeenCalledWith("role-1");
    expect(result).toEqual({
      data: {
        _id: "role-1",
        name: "Admin",
        permissions: ["admin_access", "user_access"],
      },
      errors: [],
    });
  });

  it("deleteUserRole deletes role and invalidates permissions cache", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleFindByIdAndDeleteMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: { toString: () => "role-1" },
      }),
    });
    mocks.invalidatePermissionsCacheForRoleMock.mockResolvedValueOnce(2);

    const result = await deleteUserRole("role-1", "en");

    expect(mocks.userRoleFindByIdAndDeleteMock).toHaveBeenCalledWith("role-1");
    expect(mocks.invalidatePermissionsCacheForRoleMock).toHaveBeenCalledWith("role-1");
    expect(result).toEqual({
      data: {
        _id: "role-1",
        deleted: true,
      },
      errors: [],
    });
  });
});
