type ExternalError = {
  code?: unknown;
  status?: unknown;
  response?: {
    status?: unknown;
    data?: { error?: unknown };
  };
  cause?: { code?: unknown; status?: unknown; message?: unknown };
};

function safeNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function safeReason(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (value === "Calendar API timeout") return "timeout";
  return /^[a-z0-9_.-]{1,64}$/i.test(value) ? value : undefined;
}

export function getSafeIntegrationError(error: unknown) {
  const candidate = (error && typeof error === "object" ? error : {}) as ExternalError;
  return {
    code: safeNumber(candidate.code) ?? safeNumber(candidate.cause?.code),
    status:
      safeNumber(candidate.status) ??
      safeNumber(candidate.response?.status) ??
      safeNumber(candidate.cause?.status),
    reason:
      safeReason(candidate.response?.data?.error) ??
      safeReason(candidate.cause?.message) ??
      "external_error",
  };
}

export function logSafeIntegrationError(operation: string, error: unknown) {
  const details = getSafeIntegrationError(error);
  const logger = details.reason === "invalid_grant" ? console.warn : console.error;
  logger(`${operation} failed`, details);
}
