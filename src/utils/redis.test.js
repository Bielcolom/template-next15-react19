import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectMock: vi.fn(),
  destroyMock: vi.fn(),
  onMock: vi.fn(),
  createClientMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  loggerWarnMock: vi.fn(),
}));

vi.mock("redis", () => ({
  createClient: mocks.createClientMock,
}));

vi.mock("./logger", () => ({
  logger: {
    error: mocks.loggerErrorMock,
    warn: mocks.loggerWarnMock,
    info: vi.fn(),
  },
}));

const loadRedisModule = async ({ redisUrl, nodeEnv = "test", connectError = null } = {}) => {
  vi.resetModules();
  process.env.NODE_ENV = nodeEnv;

  if (typeof redisUrl === "undefined") {
    delete process.env.REDIS_URL;
  } else {
    process.env.REDIS_URL = redisUrl;
  }

  mocks.onMock.mockReset();
  mocks.destroyMock.mockReset();
  mocks.connectMock.mockReset();
  mocks.connectMock.mockImplementation(async () => {
    if (connectError) {
      throw connectError;
    }
  });
  mocks.createClientMock.mockReset();
  mocks.createClientMock.mockImplementation(() => ({
    on: mocks.onMock,
    connect: mocks.connectMock,
    destroy: mocks.destroyMock,
  }));

  return import("./redis");
};

describe("redis helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    delete process.env.REDIS_URL;
    process.env.NODE_ENV = "test";
  });

  it("returns null without attempting a connection when REDIS_URL is missing", async () => {
    const redisModule = await loadRedisModule();

    await expect(redisModule.getRedisClient()).resolves.toBeNull();
    expect(mocks.createClientMock).not.toHaveBeenCalled();
  });

  it("normalizes localhost and warns once when local Redis is unavailable", async () => {
    const connectionError = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:6379"), {
      code: "ECONNREFUSED",
      address: "127.0.0.1",
      port: 6379,
    });

    const redisModule = await loadRedisModule({
      redisUrl: "redis://localhost:6379",
      connectError: connectionError,
    });

    await expect(redisModule.getRedisClient()).resolves.toBeNull();
    await expect(redisModule.getRedisClient()).resolves.toBeNull();

    expect(mocks.createClientMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: "redis://127.0.0.1:6379" })
    );
    expect(mocks.loggerWarnMock).toHaveBeenCalledTimes(1);
    expect(mocks.loggerErrorMock).not.toHaveBeenCalled();
  });
});
