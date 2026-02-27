import { describe, expect, it } from "vitest";
import {
  getLocaleFromPath,
  normalizePermissions,
  pathisSuperAdminProtected,
  stripLocaleFromPath,
  withLocalePath,
} from "./helpers";

describe("normalizePermissions", () => {
  it("returns an array unchanged", () => {
    expect(normalizePermissions(["admin_access"])).toEqual(["admin_access"]);
  });

  it("wraps a string permission", () => {
    expect(normalizePermissions("admin_access")).toEqual(["admin_access"]);
  });

  it("returns empty array for nullish values", () => {
    expect(normalizePermissions(null)).toEqual([]);
    expect(normalizePermissions(undefined)).toEqual([]);
  });
});

describe("locale path helpers", () => {
  it("detects locale from path", () => {
    expect(getLocaleFromPath("/es/backoffice")).toBe("es");
    expect(getLocaleFromPath("/en")).toBe("en");
    expect(getLocaleFromPath("/backoffice")).toBeNull();
  });

  it("strips locale and keeps canonical path", () => {
    expect(stripLocaleFromPath("/es/backoffice")).toBe("/backoffice");
    expect(stripLocaleFromPath("/en")).toBe("/");
    expect(stripLocaleFromPath("/about")).toBe("/about");
  });

  it("adds locale to canonical path", () => {
    expect(withLocalePath("/backoffice", "es")).toBe("/es/backoffice");
    expect(withLocalePath("/", "en")).toBe("/en");
    expect(withLocalePath("/login", "xx")).toBe("/es/login");
  });
});

describe("route protection helpers", () => {
  it("matches superadmin protected canonical routes", () => {
    expect(pathisSuperAdminProtected("/backoffice/userRoles")).toBe(true);
    expect(pathisSuperAdminProtected("/about")).toBe(false);
  });
});
