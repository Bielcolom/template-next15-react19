import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookiesMock,
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

const loadSessionModule = async (cookieStore) => {
  process.env.SESSION_SECRET = "12345678901234567890123456789012";
  process.env.NODE_ENV = "test";
  mocks.cookiesMock.mockResolvedValue(cookieStore);
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

  it("requirePermission throws FORBIDDEN when permission is missing", async () => {
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

    await expect(
      sessionModule.requirePermission(["admin_access", "superadmin_access"])
    ).rejects.toThrow("FORBIDDEN");
  });

  it("requirePermission returns payload when permission exists", async () => {
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

    const payload = await sessionModule.requirePermission("superadmin_access");
    expect(payload.userId).toBe("user-1");
  });
});
