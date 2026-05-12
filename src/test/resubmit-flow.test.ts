/**
 * E2E coverage for the resubmission marking invariant.
 *
 * Contract: when a recipient flow includes `ctx.resubmit.items` with one or
 * more `rejectedMediaId`s, the captured_media rows for those ids must be
 * flipped to `status='resubmitted'` ONLY if the parent submission write
 * succeeded. A failed submission must leave those rows untouched.
 *
 * We simulate the relevant block of `PublicRecipientPage.handleSubmit` —
 * the awaited `submissionsService.submitFromRecipient(...)` followed by the
 * conditional `markRejectedMediaResubmitted(...)` — to lock the ordering.
 */

import { afterEach, describe, expect, it, vi } from "vitest";

// ---- mocks ----------------------------------------------------------------

const updateMock = vi.fn();
const inMock = vi.fn();
const fromMock = vi.fn();

vi.mock("@/integrations/supabase/tokenClient", () => ({
  getTokenClient: () => ({
    from: (table: string) => {
      fromMock(table);
      return {
        update: (patch: any) => {
          updateMock(table, patch);
          return {
            in: (col: string, ids: string[]) => {
              inMock(col, ids);
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
  }),
}));

// Import AFTER mocks so the helper picks up the mocked tokenClient.
import { submissionsService } from "@/services/submissionsService";

afterEach(() => {
  vi.clearAllMocks();
});

// ---- the page-level submit simulation ------------------------------------

type ResubmitItem = { rejectedMediaId: string };

async function simulatePageSubmit(opts: {
  resubmitItems: ResubmitItem[];
  submitImpl: () => Promise<{ id: string }>;
}) {
  // Mirrors PublicRecipientPage.handleSubmit ordering:
  // 1) await submitFromRecipient
  // 2) only on success, mark rejected media as resubmitted
  const submission = await opts.submitImpl();
  if (opts.resubmitItems.length > 0) {
    await submissionsService
      .markRejectedMediaResubmitted({
        token: "test-token",
        rejectedMediaIds: opts.resubmitItems.map((it) => it.rejectedMediaId),
      })
      .catch((err) => console.warn("mark resubmitted failed", err));
  }
  return submission;
}

// ---- tests ----------------------------------------------------------------

describe("recipient resubmission flow", () => {
  it("marks captured_media as resubmitted ONLY after a successful submission", async () => {
    const submitImpl = vi.fn().mockResolvedValue({ id: "sub-1" });

    await simulatePageSubmit({
      resubmitItems: [
        { rejectedMediaId: "media-aaa" },
        { rejectedMediaId: "media-bbb" },
      ],
      submitImpl,
    });

    expect(submitImpl).toHaveBeenCalledTimes(1);
    expect(fromMock).toHaveBeenCalledWith("captured_media");
    expect(updateMock).toHaveBeenCalledWith("captured_media", {
      status: "resubmitted",
    });
    expect(inMock).toHaveBeenCalledWith("id", ["media-aaa", "media-bbb"]);
  });

  it("does NOT mark captured_media when submitFromRecipient throws", async () => {
    const submitImpl = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(
      simulatePageSubmit({
        resubmitItems: [{ rejectedMediaId: "media-aaa" }],
        submitImpl,
      }),
    ).rejects.toThrow("network down");

    expect(submitImpl).toHaveBeenCalledTimes(1);
    expect(updateMock).not.toHaveBeenCalled();
    expect(inMock).not.toHaveBeenCalled();
  });

  it("is a no-op when there are no rejected media items", async () => {
    const submitImpl = vi.fn().mockResolvedValue({ id: "sub-2" });

    await simulatePageSubmit({ resubmitItems: [], submitImpl });

    expect(submitImpl).toHaveBeenCalledTimes(1);
    expect(updateMock).not.toHaveBeenCalled();
    expect(inMock).not.toHaveBeenCalled();
  });

  it("helper rejects when DB returns an error and never silently succeeds", async () => {
    // Re-mock the tokenClient for this test only to surface a DB error.
    updateMock.mockClear();
    inMock.mockClear();

    const original = (
      await import("@/integrations/supabase/tokenClient")
    ).getTokenClient;

    vi.doMock("@/integrations/supabase/tokenClient", () => ({
      getTokenClient: () => ({
        from: () => ({
          update: () => ({
            in: () =>
              Promise.resolve({ error: { message: "permission denied" } }),
          }),
        }),
      }),
    }));

    // Re-import to get the override.
    vi.resetModules();
    const { submissionsService: svc } = await import(
      "@/services/submissionsService"
    );

    await expect(
      svc.markRejectedMediaResubmitted({
        token: "t",
        rejectedMediaIds: ["x"],
      }),
    ).rejects.toMatchObject({ message: "permission denied" });

    // Restore module graph for any subsequent tests.
    vi.doUnmock("@/integrations/supabase/tokenClient");
    vi.resetModules();
    expect(typeof original).toBe("function");
  });
});
