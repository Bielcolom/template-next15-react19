import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  compareMock: vi.fn(),
  userFindOneMock: vi.fn(),
  userCreateMock: vi.fn(),
  userFindByIdAndUpdateMock: vi.fn(),
  userRoleFindOneMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compareMock,
  },
}));

vi.mock("../../models/User.js", () => ({
  default: {
    findOne: mocks.userFindOneMock,
    create: mocks.userCreateMock,
    findByIdAndUpdate: mocks.userFindByIdAndUpdateMock,
  },
}));

vi.mock("../../models/UserRole.js", () => ({
  default: {
    findOne: mocks.userRoleFindOneMock,
    findById: mocks.userRoleFindByIdMock,
  },
}));

import { authenticateUser, createUser, registerUser, updateUser } from "./actions.mjs";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("shared createUser helper", () => {
  it("creates a user when email does not exist", async () => {
    const createdPayloads = [];
    mocks.userFindOneMock.mockResolvedValueOnce(null);
    mocks.userCreateMock.mockImplementation(async (payload) => {
      createdPayloads.push(payload);
      return {
        ...payload,
        _id: "user-1",
      };
    });

    const result = await createUser({
      user: {
        name: "John",
        email: "  JOHN@EXAMPLE.COM  ",
        userRoleId: "role-1",
        passwordHash: "hashed",
      },
    });

    expect(createdPayloads[0]).toEqual({
      name: "John",
      email: "  JOHN@EXAMPLE.COM  ",
      userRoleId: "role-1",
      password: "hashed",
    });
    expect(result).toEqual({
      status: "created",
      user: {
        name: "John",
        email: "  JOHN@EXAMPLE.COM  ",
        userRoleId: "role-1",
        password: "hashed",
        _id: "user-1",
      },
    });
  });

  it("returns exists when user already exists and mode is error", async () => {
    mocks.userFindOneMock.mockResolvedValueOnce({ _id: "existing", email: "john@example.com" });

    const result = await createUser({
      user: {
        name: "John",
        email: "john@example.com",
        userRoleId: "role-1",
        passwordHash: "hashed",
      },
    });

    expect(result.status).toBe("exists");
    expect(mocks.userCreateMock).not.toHaveBeenCalled();
  });

  it("updates existing user with updateUser", async () => {
    mocks.userFindByIdAndUpdateMock.mockResolvedValueOnce({
      _id: "user-1",
      email: "john@example.com",
      name: "New Name",
    });

    const result = await updateUser({
      userId: "user-1",
      user: {
        name: "New Name",
        userRoleId: "role-1",
      },
    });

    expect(mocks.userFindByIdAndUpdateMock).toHaveBeenCalledWith(
      "user-1",
      {
        name: "New Name",
        userRoleId: "role-1",
      },
      {
        new: true,
        runValidators: true,
      }
    );
    expect(result.status).toBe("updated");
    expect(result.user.name).toBe("New Name");
  });
});

describe("shared registerUser helper", () => {
  it("returns missing_default_role when configured role is not found", async () => {
    mocks.userRoleFindOneMock.mockResolvedValueOnce(null);

    const result = await registerUser({
      rolePermission: "user_access",
      user: {
        name: "John",
        email: "john@example.com",
        passwordHash: "hashed",
      },
    });

    expect(result).toEqual({
      status: "missing_default_role",
    });
  });
});

describe("shared authenticateUser helper", () => {
  it("returns invalid_credentials when password does not match", async () => {
    mocks.compareMock.mockResolvedValueOnce(false);
    mocks.userFindOneMock.mockResolvedValueOnce({
      _id: "user-1",
      email: "john@example.com",
      password: "hashed",
      userRoleId: "role-1",
    });

    const result = await authenticateUser({
      user: {
        email: "john@example.com",
        password: "bad-pass",
      },
    });

    expect(result).toEqual({
      status: "invalid_credentials",
    });
  });

  it("returns authenticated payload with permissions on valid credentials", async () => {
    mocks.compareMock.mockResolvedValueOnce(true);
    mocks.userFindOneMock.mockResolvedValueOnce({
      _id: { toString: () => "user-1" },
      email: "john@example.com",
      password: "hashed",
      userRoleId: "role-1",
      toObject: () => ({
        email: "john@example.com",
        userRoleId: "role-1",
      }),
    });
    mocks.userRoleFindByIdMock.mockResolvedValueOnce({
      permissions: ["admin_access"],
    });

    const result = await authenticateUser({
      user: {
        email: "john@example.com",
        password: "valid-pass",
      },
    });

    expect(result).toEqual({
      status: "authenticated",
      user: {
        email: "john@example.com",
        userRoleId: "role-1",
        _id: "user-1",
      },
      permissions: ["admin_access"],
    });
  });
});
