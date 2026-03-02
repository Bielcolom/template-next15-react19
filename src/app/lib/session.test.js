import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  connectDBMock: vi.fn(),
  userFindByIdMock: vi.fn(),
  userRoleFindByIdMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookiesMock,
}));

vi.mock("@/utils/connectDB", () => ({
  connectDB: mocks.connectDBMock,
}));

vi.mock("@/models/User", () => ({
  default: {
    findById: mocks.userFindByIdMock,
  },
}));

vi.mock("@/models/UserRole", () => ({
  default: {
    findById: mocks.userRoleFindByIdMock,
  },
}));

const buildCookieStore = (sessionValue) => {
  const values = new Map();
  if (sessionValue) {
    values.set("session", sessionValue);
  }

  return {
    get: vi.fn((name) => {
      const value = values.get(name);
      return value ? { value } : undefined;
    }),
    set: vi.fn((name, value, options) => {
      values.set(name, value);
      return { name, value, options };
    }),
  };
};

const mockCurrentPermissions = (permissions) => {
  mocks.userFindByIdMock.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValueOnce({ userRoleId: "role-1" }),
    }),
  });
  mocks.userRoleFindByIdMock.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValueOnce({ permissions }),
    }),
  });
};

const mockMissingUser = () => {
  mocks.userFindByIdMock.mockReturnValueOnce({
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValueOnce(null),
    }),
  });
};

const loadSessionModule = async (cookieStore) => {
  process.env.SESSION_SECRET = "12345678901234567890123456789012";
  process.env.NODE_ENV = "test";
  mocks.cookiesMock.mockResolvedValue(cookieStore);
  mocks.connectDBMock.mockResolvedValue(undefined);
  return import("./session");
};

describe("session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("encrypt/decrypt roundtrip works", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["admin_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    const payload = await sessionModule.decrypt(token);
    expect(payload.userId).toBe("user-1");
    expect(payload.permissions).toEqual(["admin_access"]);
  });

  it("createSession writes session and userId cookies", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);

    await sessionModule.createSession(
      { _id: "user-1" },
      ["user_access"]
    );

    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    const [sessionCall, userIdCall] = cookieStore.set.mock.calls;

    expect(sessionCall[0]).toBe("session");
    expect(typeof sessionCall[1]).toBe("string");
    expect(sessionCall[2]).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/",
    });

    expect(userIdCall[0]).toBe("userId");
    expect(userIdCall[1]).toBe("user-1");
  });

  it("deleteSession expires both cookies", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);

    await sessionModule.deleteSession();

    expect(cookieStore.set).toHaveBeenCalledTimes(2);
    const [firstCall, secondCall] = cookieStore.set.mock.calls;
    expect(firstCall[0]).toBe("userId");
    expect(secondCall[0]).toBe("session");
    expect(firstCall[2].maxAge).toBe(0);
    expect(secondCall[2].maxAge).toBe(0);
  });

  it("requirePermission throws UNAUTHORIZED without session cookie", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);

    await expect(
      sessionModule.requirePermission("admin_access")
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("requirePermission throws FORBIDDEN when current permission is missing", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["admin_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    cookieStore.get.mockImplementation((name) =>
      name === "session" ? { value: token } : undefined
    );
    mockCurrentPermissions(["user_access"]);

    await expect(
      sessionModule.requirePermission(["admin_access", "superadmin_access"])
    ).rejects.toThrow("FORBIDDEN");
  });

  it("requirePermission returns payload when current permission exists", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["user_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    cookieStore.get.mockImplementation((name) =>
      name === "session" ? { value: token } : undefined
    );
    mockCurrentPermissions(["superadmin_access"]);

    const payload = await sessionModule.requirePermission("superadmin_access");
    expect(payload.userId).toBe("user-1");
    expect(payload.permissions).toEqual(["superadmin_access"]);
  });

  it("getCurrentSession returns current permissions from the database", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["admin_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    cookieStore.get.mockImplementation((name) =>
      name === "session" ? { value: token } : undefined
    );
    mockCurrentPermissions(["user_access"]);

    const session = await sessionModule.getCurrentSession();

    expect(session.userId).toBe("user-1");
    expect(session.permissions).toEqual(["user_access"]);
  });

  it("requirePermission blocks stale tokens after role downgrade", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["superadmin_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    cookieStore.get.mockImplementation((name) =>
      name === "session" ? { value: token } : undefined
    );
    mockCurrentPermissions(["user_access"]);

    await expect(
      sessionModule.requirePermission("superadmin_access")
    ).rejects.toThrow("FORBIDDEN");
  });

  it("requirePermission throws UNAUTHORIZED when user no longer exists", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);
    const token = await sessionModule.encrypt({
      userId: "user-1",
      permissions: ["admin_access"],
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    });

    cookieStore.get.mockImplementation((name) =>
      name === "session" ? { value: token } : undefined
    );
    mockMissingUser();

    await expect(
      sessionModule.requirePermission("admin_access")
    ).rejects.toThrow("UNAUTHORIZED");
  });

  it("getCurrentSession returns null without a valid session", async () => {
    const cookieStore = buildCookieStore();
    const sessionModule = await loadSessionModule(cookieStore);

    const session = await sessionModule.getCurrentSession();

    expect(session).toBeNull();
  });
});
