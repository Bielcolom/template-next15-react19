import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectDBMock: vi.fn(),
  userFindByIdMock: vi.fn(),
  userFindMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
  getRedisJsonMock: vi.fn(),
  setRedisJsonMock: vi.fn(),
  deleteRedisKeyMock: vi.fn(),
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/utils/redis", () => ({
  getRedisJson: mocks.getRedisJsonMock,
  setRedisJson: mocks.setRedisJsonMock,
  deleteRedisKey: mocks.deleteRedisKeyMock,
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: mocks.userFindByIdMock,
    find: mocks.userFindMock,
  },
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    findById: mocks.userRoleFindByIdMock,
  },
}));

describe("permission cache helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connectDBMock.mockResolvedValue(undefined);
    mocks.getRedisJsonMock.mockResolvedValue(null);
    mocks.setRedisJsonMock.mockResolvedValue(true);
    mocks.deleteRedisKeyMock.mockResolvedValue(true);
  });

  it("returns cached permissions without hitting Mongo", async () => {
    mocks.getRedisJsonMock.mockResolvedValueOnce(["admin_access"]);

    const { getCurrentPermissions } = await import("./permissionCache");
    const permissions = await getCurrentPermissions("user-1");

    expect(permissions).toEqual(["admin_access"]);
    expect(mocks.connectDBMock).not.toHaveBeenCalled();
  });

  it("loads permissions from Mongo and warms Redis on cache miss", async () => {
    mocks.userFindByIdMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValueOnce({ userRoleId: "role-1" }),
      }),
    });
    mocks.userRoleFindByIdMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValueOnce({ permissions: ["superadmin_access"] }),
      }),
    });

    const { getCurrentPermissions } = await import("./permissionCache");
    const permissions = await getCurrentPermissions("user-1");

    expect(permissions).toEqual(["superadmin_access"]);
    expect(mocks.connectDBMock).toHaveBeenCalledTimes(1);
    expect(mocks.setRedisJsonMock).toHaveBeenCalledTimes(1);
  });

  it("invalidates all cached users for a role", async () => {
    mocks.userFindMock.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValueOnce([
          { _id: { toString: () => "user-1" } },
          { _id: { toString: () => "user-2" } },
        ]),
      }),
    });

    const { invalidatePermissionsCacheForRole } = await import("./permissionCache");
    const invalidatedCount = await invalidatePermissionsCacheForRole("role-1");

    expect(invalidatedCount).toBe(2);
    expect(mocks.deleteRedisKeyMock).toHaveBeenCalledWith("auth:permissions:user-1");
    expect(mocks.deleteRedisKeyMock).toHaveBeenCalledWith("auth:permissions:user-2");
  });
});
