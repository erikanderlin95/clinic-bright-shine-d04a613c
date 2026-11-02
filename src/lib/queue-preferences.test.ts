import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { resolveQueueVisibilityMode } from "./queue-visibility";
import { getWalkinRecords } from "./walkin-records";
import type { QueueEntry } from "../types/queue";

describe("Queue preferences", () => {
  test("Live Queue is the default while explicit Smart Wait is preserved", () => {
    assert.equal(resolveQueueVisibilityMode(null), "live");
    assert.equal(resolveQueueVisibilityMode("live"), "live");
    assert.equal(resolveQueueVisibilityMode("smart"), "smart");
  });
  test("all terminal records across the last 30 calendar days are included together", () => {
    const entry = (id: string, visitDate: string, status: QueueEntry["status"] = "completed"): QueueEntry => ({
      id, visitDate, status, queueNumber: id, joinedAt: "10:00", mobile: "", queueSource: "Walk-in",
    });
    const records = getWalkinRecords([
      entry("today", "2026-11-02"),
      entry("oldest", "2026-10-04", "cancelled"),
      entry("middle", "2026-10-20", "no-show"),
      entry("too-old", "2026-10-03"),
      entry("future", "2026-11-03"),
      entry("active", "2026-11-02", "waiting"),
    ], new Date(2026, 10, 2));
    assert.deepEqual(records.map(({ id }) => id), ["today", "middle", "oldest"]);
  });
});