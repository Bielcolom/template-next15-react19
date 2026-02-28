export class AppError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export const hasErrorCode = (error, code) => {
  return error?.code === code || error?.message === code;
};
