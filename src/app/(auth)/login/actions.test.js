import { beforeEach, describe, expect, it, vi } from "vitest";
import { INDEX_URL, getLocalizedPath } from "@/utils/urls";

const mocks = vi.hoisted(() => ({
  compareMock: vi.fn(),
  createSessionMock: vi.fn(),
  deleteSessionMock: vi.fn(),
  connectDBMock: vi.fn(),
  redirectMock: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
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

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
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

const buildLoginFormData = (overrides = {}) => {
  const formData = new FormData();
  formData.set("email", overrides.email || "admin@example.com");
  formData.set("password", overrides.password || "12345678");
  formData.set("locale", overrides.locale || "en");
  return formData;
};

describe("login action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors for invalid payload", async () => {
    const result = await login({}, buildLoginFormData({ email: "invalid", password: "123" }));
    expect(result.errors).toBeTruthy();
    expect(mocks.connectDBMock).not.toHaveBeenCalled();
  });

  it("returns credentials error when user is not found", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.userFindOneMock.mockResolvedValueOnce(null);

    const result = await login({}, buildLoginFormData({ email: "  ADMIN@EXAMPLE.COM  " }));

    expect(result).toEqual({
      errors: {
        email: ["Invalid email or password"],
      },
    });
    expect(mocks.userFindOneMock).toHaveBeenCalledWith({ email: "admin@example.com" });
  });

  it("creates session and redirects on valid credentials", async () => {
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

    await expect(login({}, buildLoginFormData({ email: "  ADMIN@EXAMPLE.COM  " }))).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.createSessionMock).toHaveBeenCalledWith(
      { email: "admin@example.com", userRoleId: "role-1", _id: "user-1" },
      ["admin_access"]
    );
    expect(mocks.userFindOneMock).toHaveBeenCalledWith({ email: "admin@example.com" });
    expect(mocks.redirectMock).toHaveBeenCalledWith(getLocalizedPath(INDEX_URL, "en"));
  });
});

describe("logout action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteSession", async () => {
    mocks.deleteSessionMock.mockResolvedValueOnce(undefined);
    const result = await logout("en");
    expect(mocks.deleteSessionMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it("returns a localized general error when logout fails", async () => {
    mocks.deleteSessionMock.mockRejectedValueOnce(new Error("boom"));

    const result = await logout("en");

    expect(result).toEqual({
      errors: {
        general: ["An unexpected error occurred. Please try again."],
      },
    });
  });
});
