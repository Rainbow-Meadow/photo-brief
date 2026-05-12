/**
 * Tests for the client-side validation of `submitFromRecipient` responses.
 *
 * Contract:
 *  - A valid `{ id: <uuid> }` payload parses successfully.
 *  - A missing or non-uuid `id`, or a non-object payload, throws
 *    `InvalidSubmitResponseError` so the UI never transitions to /done.
 *  - The error carries the raw payload + zod issues for support logs.
 */

import { describe, expect, it } from "vitest";
import {
  RecipientSubmitResponseSchema,
  InvalidSubmitResponseError,
} from "@/services/submissionsService";

function parseOrThrow(raw: unknown) {
  const r = RecipientSubmitResponseSchema.safeParse(raw);
  if (!r.success) throw new InvalidSubmitResponseError(raw, r.error.issues);
  return r.data;
}

describe("RecipientSubmitResponseSchema", () => {
  it("accepts a well-formed { id: uuid } payload", () => {
    const ok = parseOrThrow({ id: "11111111-2222-3333-4444-555555555555" });
    expect(ok.id).toBe("11111111-2222-3333-4444-555555555555");
  });

  it("rejects a missing id", () => {
    expect(() => parseOrThrow({})).toThrow(InvalidSubmitResponseError);
  });

  it("rejects a non-uuid id", () => {
    expect(() => parseOrThrow({ id: "not-a-uuid" })).toThrow(
      InvalidSubmitResponseError,
    );
  });

  it("rejects null / non-object payloads", () => {
    expect(() => parseOrThrow(null)).toThrow(InvalidSubmitResponseError);
    expect(() => parseOrThrow("oops")).toThrow(InvalidSubmitResponseError);
    expect(() => parseOrThrow(undefined)).toThrow(InvalidSubmitResponseError);
  });

  it("preserves raw payload + issues on the thrown error for support logs", () => {
    try {
      parseOrThrow({ id: 42 });
      throw new Error("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(InvalidSubmitResponseError);
      const e = err as InvalidSubmitResponseError;
      expect(e.code).toBe("INVALID_SUBMIT_RESPONSE");
      expect(e.raw).toEqual({ id: 42 });
      expect(Array.isArray(e.issues)).toBe(true);
    }
  });
});
