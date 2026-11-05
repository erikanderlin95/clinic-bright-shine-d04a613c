/// <reference types="node" />
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { buildDemoPatients, filterDemoPatients, demoPatientCsv } from "./clinic-portal-demo";
const now = new Date(2026, 10, 5, 12);
test("mock-up contains exactly 30 fictional patients", () => {
  const patients = buildDemoPatients(now);
  assert.equal(patients.length, 30);
  assert.equal(new Set(patients.map(p => p.id)).size, 30);
  assert.equal(patients[0].date, "2026-11-05");
  assert.equal(patients[29].date, "2026-10-07");
});
test("demo search and date filters select only matching records", () => {
  const patients = buildDemoPatients(now);
  assert.equal(filterDemoPatients(patients, "", "30", now).length, 30);
  assert.equal(filterDemoPatients(patients, "", "7", now).length, 7);
  assert.equal(filterDemoPatients(patients, "grace", "30", now)[0].name, "Grace Chua");
});
test("demo export includes exactly the filtered fictional records", () => {
  const csv = demoPatientCsv(filterDemoPatients(buildDemoPatients(now), "grace", "30", now));
  assert.equal(csv.split("\r\n").length, 2);
  assert.ok(csv.includes("DEMO ONLY"));
  assert.ok(csv.includes("Grace Chua"));
  assert.equal(csv.includes("Ahmad Rahman"), false);
});