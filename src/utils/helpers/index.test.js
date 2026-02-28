import { describe, expect, it } from "vitest";
import { ABOUT_URL, BACKOFFICE_URL, BACKOFFICE_USERROLES_URL, LOGIN_URL } from "../urls";
import {
  getLocaleFromPath,
  normalizePermissions,
  pathisSuperAdminProtected,
  stripLocaleFromPath,
  withLocalePath,
} from "./index";

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
    expect(getLocaleFromPath(`/es${BACKOFFICE_URL}`)).toBe("es");
    expect(getLocaleFromPath("/en")).toBe("en");
    expect(getLocaleFromPath(BACKOFFICE_URL)).toBeNull();
  });

  it("strips locale and keeps canonical path", () => {
    expect(stripLocaleFromPath(`/es${BACKOFFICE_URL}`)).toBe(BACKOFFICE_URL);
    expect(stripLocaleFromPath("/en")).toBe("/");
    expect(stripLocaleFromPath(ABOUT_URL)).toBe(ABOUT_URL);
  });

  it("adds locale to canonical path", () => {
    expect(withLocalePath(BACKOFFICE_URL, "es")).toBe(`/es${BACKOFFICE_URL}`);
    expect(withLocalePath("/", "en")).toBe("/en");
    expect(withLocalePath(LOGIN_URL, "xx")).toBe(`/es${LOGIN_URL}`);
  });
});

describe("route protection helpers", () => {
  it("matches superadmin protected canonical routes", () => {
    expect(pathisSuperAdminProtected(BACKOFFICE_USERROLES_URL)).toBe(true);
    expect(pathisSuperAdminProtected(ABOUT_URL)).toBe(false);
  });
});
