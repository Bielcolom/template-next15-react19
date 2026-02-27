import { beforeEach, describe, expect, it, vi } from "vitest";
import { INDEX_URL, getLocalizedPath } from "@/utils/urls";

const mocks = vi.hoisted(() => {
  const userCtorMock = vi.fn();
  userCtorMock.findOne = vi.fn();

  return {
    hashMock: vi.fn(),
    connectDBMock: vi.fn(),
    createSessionMock: vi.fn(),
    redirectMock: vi.fn(() => {
      throw new Error("NEXT_REDIRECT");
    }),
    findOneUserMock: userCtorMock.findOne,
    saveMock: vi.fn(),
    userCtorMock,
    userRoleFindOneMock: vi.fn(),
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

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
}));

vi.mock("@/models/User", () => ({
  default: mocks.userCtorMock,
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    findOne: mocks.userRoleFindOneMock,
  },
}));

import { register } from "./actions";

const buildValidFormData = () => {
  const formData = new FormData();
  formData.set("name", "John Doe");
  formData.set("email", "john@example.com");
  formData.set("password", "12345678");
  formData.set("confirmPassword", "12345678");
  formData.set("locale", "en");
  return formData;
};

describe("register action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userCtorMock.mockImplementation(function userModelMock(data) {
      return {
      ...data,
      _id: { toString: () => "user-1" },
      save: mocks.saveMock,
      toObject: () => data,
      };
    });
  });

  it("returns validation errors for invalid form data", async () => {
    const formData = new FormData();
    formData.set("email", "bad");
    formData.set("password", "123");
    formData.set("confirmPassword", "123");
    formData.set("locale", "en");

    const result = await register({}, formData);

    expect(result.errors).toBeTruthy();
    expect(mocks.connectDBMock).not.toHaveBeenCalled();
  });

  it("returns error when email is already registered", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.findOneUserMock.mockResolvedValueOnce({ _id: "existing" });

    const result = await register({}, buildValidFormData());

    expect(result).toEqual({
      errors: {
        email: ["Email is already registered"],
      },
    });
  });

  it("returns error when default user role is missing", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.findOneUserMock.mockResolvedValueOnce(null);
    mocks.hashMock.mockResolvedValueOnce("hashed");
    mocks.userRoleFindOneMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce(null),
    });

    const result = await register({}, buildValidFormData());

    expect(result).toEqual({
      errors: {
        email: ["Default user role is not configured."],
      },
    });
  });

  it("creates user, creates session and redirects on success", async () => {
    mocks.connectDBMock.mockResolvedValueOnce(undefined);
    mocks.findOneUserMock.mockResolvedValueOnce(null);
    mocks.hashMock.mockResolvedValueOnce("hashed");
    mocks.userRoleFindOneMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce({
        _id: "role-user",
      }),
    });
    mocks.saveMock.mockResolvedValueOnce(undefined);
    mocks.createSessionMock.mockResolvedValueOnce({});

    await expect(register({}, buildValidFormData())).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.createSessionMock).toHaveBeenCalledWith(
      { name: "John Doe", userRoleId: "role-user", email: "john@example.com", password: "hashed", _id: "user-1" },
      ["user_access"]
    );
    expect(mocks.redirectMock).toHaveBeenCalledWith(
      `${getLocalizedPath(INDEX_URL, "en")}?toast=registrationSuccess`
    );
  });
});
