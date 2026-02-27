import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  compareMock: vi.fn(),
  createSessionMock: vi.fn(),
  deleteSessionMock: vi.fn(),
  connectDBMock: vi.fn(),
  userFindOneMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compareMock,
  },
}));

vi.mock("@/app/lib/session", () => ({
  createSession: mocks.createSessionMock,
  deleteSession: mocks.deleteSessionMock,
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/models/User", () => ({
  default: {
    findOne: mocks.userFindOneMock,
  },
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    findById: mocks.userRoleFindByIdMock,
  },
}));

import { login, logout } from "./actions";

describe("login action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors for invalid payload", async () => {
    const result = await login({ email: "invalid", password: "123", locale: "en" });
    expect(result.errors).toBeTruthy();
    expect(mocks.connectDBMock).not.toHaveBeenCalled();
  });

  it("returns credentials error when user is not found", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userFindOneMock.mockResolvedValueOnce(null);

    const result = await login({
      email: "admin@example.com",
      password: "12345678",
      locale: "en",
    });

    expect(result).toEqual({
      errors: {
        email: ["Invalid email or password"],
      },
    });
  });

  it("returns success and creates session on valid credentials", async () => {
    const userDoc = {
      _id: { toString: () => "user-1" },
      password: "hashed",
      userRoleId: "role-1",
      toObject: () => ({ email: "admin@example.com", userRoleId: "role-1" }),
    };

    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userFindOneMock.mockResolvedValueOnce(userDoc);
    mocks.compareMock.mockResolvedValueOnce(true);
    mocks.userRoleFindByIdMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        permissions: ["admin_access"],
      }),
    });
    mocks.createSessionMock.mockResolvedValueOnce({});

    const result = await login({
      email: "admin@example.com",
      password: "12345678",
      locale: "en",
    });

    expect(mocks.createSessionMock).toHaveBeenCalledWith(
      { email: "admin@example.com", userRoleId: "role-1", _id: "user-1" },
      ["admin_access"]
    );
    expect(result).toEqual({ success: true, userId: "user-1" });
  });
});

describe("logout action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteSession", async () => {
    mocks.deleteSessionMock.mockResolvedValueOnce(undefined);
    await logout();
    expect(mocks.deleteSessionMock).toHaveBeenCalledTimes(1);
  });
});
