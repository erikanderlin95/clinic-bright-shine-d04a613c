/// <reference types="node" />
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { currentSubscriptionPlan, subscriptionPlans } from "./subscription-plans";

test("Basic is the current plan with exactly two additional tiers", () => {
  assert.equal(currentSubscriptionPlan, "basic");
  assert.equal(subscriptionPlans.find(plan => plan.id === currentSubscriptionPlan)?.name, "Basic");
  assert.equal(subscriptionPlans.filter(plan => plan.id !== currentSubscriptionPlan).length, 2);
});