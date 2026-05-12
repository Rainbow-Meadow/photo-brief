/**
 * Tests that the recipient submit flow only fires
 * `trackEvent("submission_completed", ...)` and
 * `conversions.recipientSubmissionCompleted(...)` AFTER the backend write
 * (`submissionsService.submitFromRecipient`) has resolved successfully.
 *
 * Mirrors the ordering used in `PublicRecipientPage.handleSubmit`:
 *   1) await submitFromRecipient
 *   2) (optionally) markRejectedMediaResubmitted
 *   3) flow.submitAll() + analytics + conversions
 *   4) navigate to /done
 *
 * Failure modes covered:
 *   - submit rejects → no analytics, no conversions, "submission_failed" fires
 *   - submit resolves with an invalid payload → no analytics, no conversions
 *   - submit resolves with a valid payload → both fire exactly once, in order,
 *     and after the await
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RecipientSubmitResponseSchema,
  InvalidSubmitResponseError,
} from "@/services/submissionsService";

const trackEvent = vi.fn();
const recipientSubmissionCompleted = vi.fn();
const submitAll = vi.fn();

afterEach(() => {
  vi.clearAllMocks();
});

interface SimulateOpts {
  submitImpl: () => Promise<unknown>;
  guideId?: string;
  requestId?: string;
  photoCount?: number;
  answerCount?: number;
  resubmit?: boolean;
}

/** Mirrors the exact ordering of PublicRecipientPage.handleSubmit. */
async function simulateSubmit(opts: SimulateOpts) {
  const guide_id = opts.guideId ?? "guide-1";
  const request_id = opts.requestId ?? "11111111-1111-1111-1111-111111111111";
  const photoCount = opts.photoCount ?? 2;
  const answerCount = opts.answerCount ?? 1;

  try {
    const raw = await opts.submitImpl();

    // Defensive validation (matches handleSubmit).
    const parsed = RecipientSubmitResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new InvalidSubmitResponseError(raw, parsed.error.issues);
    }
    const submission = parsed.data;

    // Only after the awaited write succeeds:
    submitAll();
    trackEvent("submission_completed", {
      guide_id,
      photos: photoCount,
      answers: answerCount,
      resubmit: !!opts.resubmit,
    });
    recipientSubmissionCompleted({
      guide_id,
      request_id,
      submission_id: submission.id,
      photos: photoCount,
      answers: answerCount,
      resubmit: !!opts.resubmit,
    });
  } catch (err) {
    trackEvent("submission_failed", {
      guide_id,
      request_id,
      code: (err as { code?: string })?.code ?? "PB-500",
    });
    throw err;
  }
}

describe("recipient submit analytics ordering", () => {
  const VALID_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

  it("fires submission_completed + recipientSubmissionCompleted only AFTER the await resolves with a valid payload", async () => {
    let resolveSubmit: (v: unknown) => void = () => {};
    const submitImpl = vi.fn(
      () => new Promise((res) => (resolveSubmit = res)),
    );

    const run = simulateSubmit({ submitImpl });

    // Before the backend resolves, nothing should have fired yet.
    await Promise.resolve();
    expect(submitImpl).toHaveBeenCalledTimes(1);
    expect(trackEvent).not.toHaveBeenCalled();
    expect(recipientSubmissionCompleted).not.toHaveBeenCalled();
    expect(submitAll).not.toHaveBeenCalled();

    // Resolve the backend write.
    resolveSubmit({ id: VALID_ID });
    await run;

    // Now both analytics calls should have fired exactly once, in order,
    // AFTER submitAll().
    expect(submitAll).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      "submission_completed",
      expect.objectContaining({ guide_id: "guide-1", photos: 2, answers: 1, resubmit: false }),
    );
    expect(recipientSubmissionCompleted).toHaveBeenCalledTimes(1);
    expect(recipientSubmissionCompleted).toHaveBeenCalledWith(
      expect.objectContaining({ submission_id: VALID_ID }),
    );

    // Ordering: submitAll → trackEvent → conversion.
    const submitAllOrder = submitAll.mock.invocationCallOrder[0];
    const trackOrder = trackEvent.mock.invocationCallOrder[0];
    const convOrder = recipientSubmissionCompleted.mock.invocationCallOrder[0];
    expect(submitAllOrder).toBeLessThan(trackOrder);
    expect(trackOrder).toBeLessThan(convOrder);
  });

  it("does NOT fire submission_completed or the conversion when submit rejects", async () => {
    const submitImpl = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(simulateSubmit({ submitImpl })).rejects.toThrow("network down");

    expect(submitAll).not.toHaveBeenCalled();
    expect(recipientSubmissionCompleted).not.toHaveBeenCalled();
    // submission_completed must never fire on failure.
    expect(
      trackEvent.mock.calls.some(([name]) => name === "submission_completed"),
    ).toBe(false);
    // submission_failed should fire instead.
    expect(
      trackEvent.mock.calls.some(([name]) => name === "submission_failed"),
    ).toBe(true);
  });

  it("does NOT fire submission_completed or the conversion when the response is malformed", async () => {
    const submitImpl = vi.fn().mockResolvedValue({ id: "not-a-uuid" });

    await expect(simulateSubmit({ submitImpl })).rejects.toBeInstanceOf(
      InvalidSubmitResponseError,
    );

    expect(submitAll).not.toHaveBeenCalled();
    expect(recipientSubmissionCompleted).not.toHaveBeenCalled();
    expect(
      trackEvent.mock.calls.some(([name]) => name === "submission_completed"),
    ).toBe(false);
    expect(
      trackEvent.mock.calls.some(([name]) => name === "submission_failed"),
    ).toBe(true);
  });
});
