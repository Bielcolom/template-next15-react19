import { beforeEach, describe, expect, it, vi } from "vitest";
import { INDEX_URL, getLocalizedPath } from "@/utils/urls";
import { ROLES } from "@/utils/constants";
import { ERROR_CODES } from "@/errors/codes";

const mocks = vi.hoisted(() => {
  return {
    hashMock: vi.fn(),
    connectDBMock: vi.fn(),
    createSessionMock: vi.fn(),
    redirectMock: vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    }),
    registerUserMock: vi.fn(),
  };
});

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.hashMock,
  },
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/app/lib/session", () => ({
  createSession: mocks.createSessionMock,
}));

vi.mock("@/actions/user/actions.mjs", () => ({
  registerUser: mocks.registerUserMock,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
}));

import { createUser } from "./actions";

const buildValidFormData = (overrides = {}) => {
  const formData = new FormData();
  formData.set("name", overrides.name || "John Doe");
  formData.set("email", overrides.email || "john@example.com");
  formData.set("password", overrides.password || "12345678");
  formData.set("confirmPassword", overrides.confirmPassword || "12345678");
  formData.set("locale", overrides.locale || "en");
  return formData;
};

describe("register action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation errors for invalid form data", async () => {
    const formData = new FormData();
    formData.set("email", "bad");
    formData.set("password", "123");
    formData.set("confirmPassword", "123");
    formData.set("locale", "en");

    const result = await createUser({}, formData);

    expect(result.errors).toBeTruthy();
    expect(mocks.connectDBMock).not.toHaveBeenCalled();
  });

  it("returns error when email is already registered", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.hashMock.mockResolvedValueOnce("hashed");
    const duplicateError = new Error("duplicate");
    duplicateError.code = ERROR_CODES.EMAIL_ALREADY_REGISTERED;
    mocks.registerUserMock.mockRejectedValueOnce(duplicateError);

    const result = await createUser({}, buildValidFormData({ email: "  JOHN@EXAMPLE.COM  " }));

    expect(result).toEqual({
      errors: {
        email: ["Email is already registered"],
      },
    });
    expect(mocks.registerUserMock).toHaveBeenCalledWith({
      rolePermission: ROLES.USER,
      user: {
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashed",
      },
    });
  });

  it("returns error when default user role is missing", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.hashMock.mockResolvedValueOnce("hashed");
    const roleError = new Error("missing role");
    roleError.code = ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED;
    mocks.registerUserMock.mockRejectedValueOnce(roleError);

    const result = await createUser({}, buildValidFormData());

    expect(result).toEqual({
      errors: {
        email: ["Default user role is not configured."],
      },
    });
  });

  it("creates user, creates session and redirects on success", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.hashMock.mockResolvedValueOnce("hashed");
    mocks.registerUserMock.mockResolvedValueOnce({
      user: {
        name: "John Doe",
        userRoleId: "role-user",
        email: "john@example.com",
        passwordHash: "hashed",
        _id: "user-1",
      },
      permissions: ["user_access"],
    });
    mocks.createSessionMock.mockResolvedValueOnce({});

    await expect(createUser({}, buildValidFormData({ email: "  JOHN@EXAMPLE.COM  " }))).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.createSessionMock).toHaveBeenCalledWith(
      { name: "John Doe", userRoleId: "role-user", email: "john@example.com", passwordHash: "hashed", _id: "user-1" },
      ["user_access"]
    );
    expect(mocks.redirectMock).toHaveBeenCalledWith(
      `${getLocalizedPath(INDEX_URL, "en")}?toast=registrationSuccess`
    );
  });

  it("returns a localized error when database connection fails", async () => {
    mocks.connectDBMock.mockRejectedValueOnce(new Error("db down"));

    const result = await createUser({}, buildValidFormData({ locale: "es" }));

    expect(result).toEqual({
      errors: {
        email: ["Ha ocurrido un error. Intentalo de nuevo mas tarde."],
      },
    });
  });
});
