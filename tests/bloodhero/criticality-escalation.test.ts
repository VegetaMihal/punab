import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyCriticality, maxCriticality } from "../../src/lib/bloodhero/classify-criticality";
import { summarizeCondition } from "../../src/lib/bloodhero/summarize-condition";
import { haversineDistanceKm } from "../../src/lib/bloodhero/distance";
import { decideEscalation, type EscalationRequestRow } from "../../src/lib/bloodhero/run-escalation";

const NOW = new Date("2026-06-01T12:00:00Z");
const inHours = (h: number) => new Date(NOW.getTime() + h * 3_600_000).toISOString();

describe("classifyCriticality", () => {
  it("plain text, far future, 1 unit -> normal", () => {
    assert.equal(classifyCriticality({ condition: "planned checkup", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "normal");
  });
  it("English critical keyword", () => {
    assert.equal(classifyCriticality({ condition: "Patient in ICU after accident", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "critical");
  });
  it("Bangla critical keyword", () => {
    assert.equal(classifyCriticality({ condition: "রোগীর অপারেশন হবে", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "critical");
  });
  it("urgent keyword", () => {
    assert.equal(classifyCriticality({ condition: "dialysis patient", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "urgent");
  });
  it("needed within 6h -> critical even without keywords", () => {
    assert.equal(classifyCriticality({ condition: "", plannedDonationAt: inHours(3), quantity: 1, now: NOW }), "critical");
  });
  it("needed within 24h -> urgent", () => {
    assert.equal(classifyCriticality({ condition: "", plannedDonationAt: inHours(12), quantity: 1, now: NOW }), "urgent");
  });
  it("4+ units -> at least urgent", () => {
    assert.equal(classifyCriticality({ condition: "", plannedDonationAt: inHours(72), quantity: 4, now: NOW }), "urgent");
  });
  it("time never lowers a keyword hit", () => {
    assert.equal(classifyCriticality({ condition: "emergency", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "critical");
  });
  it("word boundaries: 'pot' does not match ot", () => {
    assert.equal(classifyCriticality({ condition: "pot", plannedDonationAt: inHours(72), quantity: 1, now: NOW }), "normal");
  });
  it("maxCriticality picks the higher", () => {
    assert.equal(maxCriticality("urgent", "normal"), "urgent");
    assert.equal(maxCriticality("normal", "critical"), "critical");
  });
});

describe("summarizeCondition", () => {
  it("null for empty", () => assert.equal(summarizeCondition("  "), null));
  it("keeps short text", () => assert.equal(summarizeCondition("short note"), "short note"));
  it("truncates long text at a word boundary", () => {
    const out = summarizeCondition("word ".repeat(80)) as string;
    assert.ok(out.length <= 141);
    assert.ok(out.endsWith("…"));
  });
});

describe("haversineDistanceKm / Dhaka radius", () => {
  const gulshan = { lat: 23.8103, lng: 90.4125 };
  it("same point is 0", () => assert.equal(haversineDistanceKm(gulshan, gulshan), 0));
  it("Uttara is within 25 km of Gulshan", () => {
    assert.ok(haversineDistanceKm(gulshan, { lat: 23.8759, lng: 90.3795 }) <= 25);
  });
  it("Manikganj is beyond 25 km of Gulshan", () => {
    assert.ok(haversineDistanceKm(gulshan, { lat: 23.8617, lng: 90.0003 }) > 25);
  });
});

function row(over: Partial<EscalationRequestRow> = {}): EscalationRequestRow {
  return {
    id: "r1",
    status: "matching",
    criticality: "critical",
    request_quantity: 1,
    created_at: NOW.toISOString(),
    last_escalation_at: null,
    escalation_count: 0,
    escalation_paused: false,
    ...over,
  };
}
const later = (min: number) => new Date(NOW.getTime() + min * 60_000);

describe("decideEscalation", () => {
  it("not due before the interval (critical = 10 min)", () => {
    assert.deepEqual(decideEscalation(row(), 0, later(9)), { run: false, reason: "not_due" });
  });
  it("due after the interval", () => {
    assert.deepEqual(decideEscalation(row(), 0, later(10)), { run: true });
  });
  it("uses last_escalation_at as baseline once set", () => {
    const r = row({ last_escalation_at: later(10).toISOString(), escalation_count: 1 });
    assert.deepEqual(decideEscalation(r, 0, later(15)), { run: false, reason: "not_due" });
    assert.deepEqual(decideEscalation(r, 0, later(20)), { run: true });
  });
  it("normal waits 120 min", () => {
    const r = row({ criticality: "normal" });
    assert.deepEqual(decideEscalation(r, 0, later(119)), { run: false, reason: "not_due" });
    assert.deepEqual(decideEscalation(r, 0, later(120)), { run: true });
  });
  it("stops at max rounds", () => {
    assert.deepEqual(decideEscalation(row({ escalation_count: 6 }), 0, later(999)), { run: false, reason: "max_rounds" });
  });
  it("skips paused", () => {
    assert.deepEqual(decideEscalation(row({ escalation_paused: true }), 0, later(999)), { run: false, reason: "paused" });
  });
  for (const status of ["fulfilled", "cancelled"]) {
    it(`skips ${status}`, () => {
      assert.deepEqual(decideEscalation(row({ status }), 0, later(999)), { run: false, reason: "closed" });
    });
  }
  it("stops once accepts cover the quantity", () => {
    assert.deepEqual(decideEscalation(row({ request_quantity: 2 }), 1, later(999)), { run: true });
    assert.deepEqual(decideEscalation(row({ request_quantity: 2 }), 2, later(999)), { run: false, reason: "fulfilled_by_accepts" });
  });
});
