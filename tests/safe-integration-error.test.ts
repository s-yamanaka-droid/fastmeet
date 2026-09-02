import { describe, expect, it } from "vitest";
import { getSafeIntegrationError } from "../lib/safe-integration-error";

describe("getSafeIntegrationError", () => {
  it("keeps diagnostic codes without serializing OAuth request data", () => {
    const details = getSafeIntegrationError({
      code: 400,
      response: { status: 400, data: { error: "invalid_grant" } },
      config: { data: { refresh_token: "must-not-appear" } },
    });

    expect(details).toEqual({ code: 400, status: 400, reason: "invalid_grant" });
    expect(JSON.stringify(details)).not.toContain("must-not-appear");
  });

  it("does not copy arbitrary error messages", () => {
    const details = getSafeIntegrationError(new Error("secret-bearing message"));

    expect(details).toEqual({ code: undefined, status: undefined, reason: "external_error" });
  });
});
