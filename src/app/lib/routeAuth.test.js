import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/errors/AppError";
import { ERROR_CODES } from "@/errors/codes";

const mocks = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  requirePermissionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirectMock,
}));

vi.mock("./session", () => ({
  requirePermission: mocks.requirePermissionMock,
}));

describe("requireRoutePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the authorized session payload", async () => {
    mocks.requirePermissionMock.mockResolvedValueOnce({
      userId: "user-1",
      permissions: ["admin_access"],
    });

    const { requireRoutePermission } = await import("./routeAuth");
    const result = await requireRoutePermission("admin_access", "es");

    expect(result).toEqual({
      userId: "user-1",
      permissions: ["admin_access"],
    });
    expect(mocks.redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to localized home when permission is forbidden", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new AppError(ERROR_CODES.FORBIDDEN));

    const { requireRoutePermission } = await import("./routeAuth");
    await requireRoutePermission("superadmin_access", "en");

    expect(mocks.redirectMock).toHaveBeenCalledWith("/en");
  });

  it("redirects to localized login when session is unauthorized", async () => {
    mocks.requirePermissionMock.mockRejectedValueOnce(new AppError(ERROR_CODES.UNAUTHORIZED));

    const { requireRoutePermission } = await import("./routeAuth");
    await requireRoutePermission("admin_access", "en");

    expect(mocks.redirectMock).toHaveBeenCalledWith("/en/login");
  });

  it("rethrows unexpected errors", async () => {
    const error = new Error("db down");
    mocks.requirePermissionMock.mockRejectedValueOnce(error);

    const { requireRoutePermission } = await import("./routeAuth");

    await expect(requireRoutePermission("admin_access", "es")).rejects.toThrow("db down");
  });
});
