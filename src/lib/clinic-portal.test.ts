/// <reference types="node" />
import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { canControlQueue, canReadCmsRecords, existingPortalCapabilities } from "./clinic-portal";

describe("Clinic portal access gates", () => {
  const connected = { clinicMapped: true, persistentQueue: true, manualClosureProtected: true, attributedCmsRecords: true };
  test("queue control requires persistent state and protected manual closure", () => {
    assert.equal(canControlQueue(connected), true);
    assert.equal(canControlQueue({ ...connected, persistentQueue: false }), false);
    assert.equal(canControlQueue({ ...connected, manualClosureProtected: false }), false);
    assert.equal(canControlQueue(existingPortalCapabilities), false);
  });
  test("records require verified ClynicQ source attribution", () => {
    assert.equal(canReadCmsRecords(connected), true);
    assert.equal(canReadCmsRecords({ ...connected, attributedCmsRecords: false }), false);
    assert.equal(canReadCmsRecords(existingPortalCapabilities), false);
  });
  test("both patient exports and queue changes require clinic mapping", () => {
    const unmapped = { ...connected, clinicMapped: false };
    assert.equal(canReadCmsRecords(unmapped), false);
    assert.equal(canControlQueue(unmapped), false);
  });
});