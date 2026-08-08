const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

export const getIdempotencyKey = (req) =>
  String(
    req.get?.("Idempotency-Key") ||
      req.headers?.["idempotency-key"] ||
      req.body?.idempotencyKey ||
      "",
  ).trim();

export const isValidIdempotencyKey = (key) =>
  IDEMPOTENCY_KEY_PATTERN.test(key);

export class FinancialOperationError extends Error {
  constructor(message, statusCode = 400, code = "FINANCIAL_OPERATION_FAILED") {
    super(message);
    this.name = "FinancialOperationError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const isDuplicateKeyError = (error) => error?.code === 11000;