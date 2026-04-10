/**
 * Minimal structured logger.
 *
 * - Development: human-readable prefixed output via console.
 * - Production:  JSON lines compatible with log aggregators
 *                (Datadog, CloudWatch, Loki, etc.).
 *
 * Drop-in replacement path: swap the `log` implementation for
 * pino / winston without touching any call sites.
 */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Safely serialize a value for structured logging.
 * Plain Error objects are not JSON-serializable by default.
 */
const serialize = (value) => {
  if (value instanceof Error) {
    return {
      message: value.message,
      code: value.code,
      stack: isDev ? value.stack : undefined,
    };
  }
  return value;
};

const LEVELS = {
  error: "error",
  warn: "warn",
  info: "info",
};

const log = (level, message, context) => {
  if (isDev) {
    const prefix = `[${level.toUpperCase()}]`;
    const consoleFn = level === LEVELS.error
      ? console.error
      : level === LEVELS.warn
        ? console.warn
        : console.log;

    context !== undefined
      ? consoleFn(prefix, message, context)
      : consoleFn(prefix, message);

    return;
  }

  const entry = {
    level,
    time: new Date().toISOString(),
    msg: message,
    ...(context !== undefined ? { context: serialize(context) } : {}),
  };

  level === LEVELS.error || level === LEVELS.warn
    ? console.error(JSON.stringify(entry))
    : console.log(JSON.stringify(entry));
};

export const logger = {
  error: (message, context) => log(LEVELS.error, message, context),
  warn:  (message, context) => log(LEVELS.warn,  message, context),
  info:  (message, context) => log(LEVELS.info,  message, context),
};
