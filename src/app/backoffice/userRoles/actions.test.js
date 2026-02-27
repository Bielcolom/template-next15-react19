import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/utils/constants";

const mocks = vi.hoisted(() => ({
  requirePermissionMock: vi.fn(),
  connectDBMock: vi.fn(),
  userRoleFindMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
}));

vi.mock("@/app/lib/session", () => ({
  requirePermission: mocks.requirePermissionMock,
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    find: mocks.userRoleFindMock,
    findById: mocks.userRoleFindByIdMock,
  },
}));

import { getUserRoleById, getUserRoles } from "./actions";

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

    const result = await getUserRoles();

    expect(mocks.requirePermissionMock).toHaveBeenCalledWith(ROLES.SUPERADMIN);
    expect(result).toEqual([
      {
        _id: "role-1",
        name: "Admin",
        permissions: ["admin_access"],
      },
    ]);
  });

  it("getUserRoles returns auth error when unauthorized", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("UNAUTHORIZED"));

    const result = await getUserRoles();

    expect(result).toEqual({
      elements: [],
      errors: ["Authentication required."],
    });
  });

  it("getUserRoleById returns not found error", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userRoleFindByIdMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null),
    });

    const result = await getUserRoleById("missing");

    expect(result).toEqual({
      userRole: null,
      errors: ["User role not found."],
    });
  });

  it("getUserRoleById returns permission error when forbidden", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("FORBIDDEN"));

    const result = await getUserRoleById("role-1");

    expect(result).toEqual({
      userRole: null,
      errors: ["Insufficient permissions."],
    });
  });
});
