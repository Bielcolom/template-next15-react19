import { describe, expect, it } from "vitest";
import { AppError, hasErrorCode } from "./AppError";

describe("AppError", () => {
  it("sets name, code and message", () => {
    const err = new AppError("MY_CODE", "my message");
    expect(err.name).toBe("AppError");
    expect(err.code).toBe("MY_CODE");
    expect(err.message).toBe("my message");
    expect(err instanceof Error).toBe(true);
  });

  it("uses code as message when no message is provided", () => {
    const err = new AppError("MY_CODE");
    expect(err.message).toBe("MY_CODE");
  });
});

describe("hasErrorCode", () => {
  it("returns true when error.code matches", () => {
    expect(hasErrorCode({ code: "FOO" }, "FOO")).toBe(true);
  });

  it("returns true when error.message matches", () => {
    expect(hasErrorCode({ message: "FOO" }, "FOO")).toBe(true);
  });

  it("returns false when neither matches", () => {
    expect(hasErrorCode({ code: "BAR", message: "BAZ" }, "FOO")).toBe(false);
  });

  it("returns false for null error", () => {
    expect(hasErrorCode(null, "FOO")).toBe(false);
  });

  it("returns false for undefined error", () => {
    expect(hasErrorCode(undefined, "FOO")).toBe(false);
  });
});
