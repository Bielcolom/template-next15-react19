import { beforeEach, describe, expect, it, vi } from "vitest";
import { ERROR_CODES } from "../../errors/codes.js";

const mocks = vi.hoisted(() => ({
  compareMock: vi.fn(),
  connectDBMock: vi.fn(),
  userFindMock: vi.fn(),
  userFindOneMock: vi.fn(),
  userCreateMock: vi.fn(),
  userFindByIdAndUpdateMock: vi.fn(),
  countDocumentsMock: vi.fn(),
  userRoleFindOneMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compareMock,
  },
}));

vi.mock("../../utils/connectDB.js", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("../../models/User.js", () => ({
  default: {
    find: mocks.userFindMock,
    findOne: mocks.userFindOneMock,
    create: mocks.userCreateMock,
    findByIdAndUpdate: mocks.userFindByIdAndUpdateMock,
    countDocuments: mocks.countDocumentsMock,
  },
}));

vi.mock("../../models/UserRole.js", () => ({
  default: {
    findOne: mocks.userRoleFindOneMock,
    findById: mocks.userRoleFindByIdMock,
  },
}));

import { authenticateUser, createUser, findFiltered, getUserCount, registerUser, updateUser } from "./actions.js";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.connectDBMock.mockResolvedValue(undefined);
});

describe("shared createUser helper", () => {
  it("creates a user when email does not exist", async () => {
    const createdPayloads = [];
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
      passwordHash: "hashed",
    });
    expect(result).toEqual({
      name: "John",
      email: "  JOHN@EXAMPLE.COM  ",
      userRoleId: "role-1",
      passwordHash: "hashed",
      _id: "user-1",
    });
  });

  it("throws EMAIL_ALREADY_REGISTERED when user already exists", async () => {
    const duplicateError = new Error("E11000 duplicate key error");
    duplicateError.code = 11000;
    mocks.userCreateMock.mockRejectedValueOnce(duplicateError);

    await expect(
      createUser({
        user: {
          name: "John",
          email: "john@example.com",
          userRoleId: "role-1",
          passwordHash: "hashed",
        },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.EMAIL_ALREADY_REGISTERED,
    });
    expect(mocks.userCreateMock).toHaveBeenCalledTimes(1);
  });

  it("returns updated user with updateUser", async () => {
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
    expect(result.name).toBe("New Name");
  });
});

describe("shared users read helpers", () => {
  it("findFiltered returns serialized users with filters", async () => {
    mocks.userFindMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([
        {
          _id: { toString: () => "user-1" },
          userRoleId: { toString: () => "role-1" },
          email: "john@example.com",
          name: "John",
        },
      ]),
    });

    const result = await findFiltered({
      userId: "user-1",
      email: "john@example.com",
      name: "John",
    });

    expect(mocks.userFindMock).toHaveBeenCalledWith({
      _id: "user-1",
      email: "john@example.com",
      name: "John",
    });
    expect(result).toEqual([
      {
        _id: "user-1",
        userRoleId: "role-1",
        email: "john@example.com",
        name: "John",
      },
    ]);
  });

  it("findFiltered returns empty array when there are no matches", async () => {
    mocks.userFindMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([]),
    });

    const result = await findFiltered({ email: "missing@example.com" });

    expect(mocks.userFindMock).toHaveBeenCalledWith({ email: "missing@example.com" });
    expect(result).toEqual([]);
  });

  it("findFiltered returns all users when filters are empty", async () => {
    mocks.userFindMock.mockReturnValueOnce({
      lean: vi.fn().mockResolvedValueOnce([
        {
          _id: { toString: () => "user-1" },
          userRoleId: { toString: () => "role-1" },
          email: "john@example.com",
          name: "John",
        },
      ]),
    });

    const result = await findFiltered();

    expect(mocks.userFindMock).toHaveBeenCalledWith({});
    expect(result).toEqual([
      {
        _id: "user-1",
        userRoleId: "role-1",
        email: "john@example.com",
        name: "John",
      },
    ]);
  });

  it("getUserCount returns countDocuments result", async () => {
    mocks.countDocumentsMock.mockResolvedValueOnce(12);

    const result = await getUserCount("en");

    expect(mocks.countDocumentsMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: 12,
      errors: [],
    });
  });
});

describe("shared registerUser helper", () => {
  it("throws DEFAULT_USER_ROLE_NOT_CONFIGURED when role is not found", async () => {
    mocks.userRoleFindOneMock.mockResolvedValueOnce(null);

    await expect(
      registerUser({
        rolePermission: "user_access",
        user: {
          name: "John",
          email: "john@example.com",
          passwordHash: "hashed",
        },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.DEFAULT_USER_ROLE_NOT_CONFIGURED,
    });
  });
});

describe("shared authenticateUser helper", () => {
  it("throws INVALID_CREDENTIALS when password does not match", async () => {
    mocks.compareMock.mockResolvedValueOnce(false);
    mocks.userFindOneMock.mockResolvedValueOnce({
      _id: "user-1",
      email: "john@example.com",
      passwordHash: "hashed",
      userRoleId: "role-1",
    });

    await expect(
      authenticateUser({
        user: {
          email: "john@example.com",
          password: "bad-pass",
        },
      })
    ).rejects.toMatchObject({
      code: ERROR_CODES.INVALID_CREDENTIALS,
    });
  });

  it("returns authenticated payload with permissions on valid credentials", async () => {
    mocks.compareMock.mockResolvedValueOnce(true);
    mocks.userFindOneMock.mockResolvedValueOnce({
      _id: { toString: () => "user-1" },
      email: "john@example.com",
      passwordHash: "hashed",
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
      user: expect.objectContaining({
        email: "john@example.com",
        userRoleId: "role-1",
      }),
      permissions: ["admin_access"],
    });
  });
});
