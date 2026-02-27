import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROLES } from "@/utils/constants";

const mocks = vi.hoisted(() => ({
  requirePermissionMock: vi.fn(),
  connectDBMock: vi.fn(),
  userFindOneMock: vi.fn(),
  countDocumentsMock: vi.fn(),
}));

vi.mock("@/app/lib/session", () => ({
  requirePermission: mocks.requirePermissionMock,
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/models/User", () => ({
  default: {
    findOne: mocks.userFindOneMock,
    countDocuments: mocks.countDocumentsMock,
  },
}));

import { findFiltered, getUserCount } from "./actions";

describe("backoffice users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findFiltered serializes user ids", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userFindOneMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: { toString: () => "user-1" },
        userRoleId: { toString: () => "role-1" },
        email: "john@example.com",
      }),
    });

    const result = await findFiltered("user-1");

    expect(mocks.requirePermissionMock).toHaveBeenCalledWith([
      ROLES.ADMIN,
      ROLES.SUPERADMIN,
    ]);
    expect(result).toEqual({
      data: {
        _id: "user-1",
        userRoleId: "role-1",
        email: "john@example.com",
      },
      errors: [],
    });
  });

  it("findFiltered returns auth error when unauthorized", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("UNAUTHORIZED"));

    const result = await findFiltered("user-1");

    expect(result).toEqual({
      data: null,
      errors: ["Authentication required."],
    });
  });

  it("getUserCount returns document count", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce(undefined);
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.countDocumentsMock.mockResolvedValueOnce(12);

    const result = await getUserCount();
    expect(result).toEqual({
      data: 12,
      errors: [],
    });
  });

  it("getUserCount returns permission error when forbidden", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new Error("FORBIDDEN"));

    const result = await getUserCount();

    expect(result).toEqual({
      data: null,
      errors: ["Insufficient permissions."],
    });
  });
});
