import { test } from "node:test";
import assert from "node:assert/strict";
import { authorize, hasPermission, normalizeRole, permissionsFor, ROLE_PERMISSIONS, PERMISSIONS } from "./rbac.js";

const run = (middleware, role) => {
  const out = { status: 200, nextCalled: false };
  const req = { user: role === undefined ? undefined : { user: { role } } };
  const res = {
    status(code) { out.status = code; return this; },
    json(body) { out.body = body; return this; },
  };
  middleware(req, res, () => { out.nextCalled = true; });
  return { ...out, req };
};

test("role matrix", () => {
  assert.ok(hasPermission("customer", "order:create"));
  assert.ok(!hasPermission("customer", "order:read"));
  assert.ok(hasPermission("support", "order:read"));
  assert.ok(!hasPermission("support", "order:update"));
  assert.ok(hasPermission("manager", "catalog:write"));
  assert.ok(!hasPermission("manager", "staff:manage"));
  assert.ok(hasPermission("admin", "staff:manage"));
  assert.ok(!hasPermission("admin", "order:create")); // staff are not shoppers
  assert.deepEqual(permissionsFor("nobody"), []);
});

test("every role only grants known permissions", () => {
  for (const perms of Object.values(ROLE_PERMISSIONS)) {
    for (const p of perms) assert.ok(PERMISSIONS.includes(p), p);
  }
});

test("legacy numeric roles from old tokens still work", () => {
  assert.equal(normalizeRole(1), "admin");
  assert.equal(normalizeRole(2), "customer");
  assert.equal(normalizeRole("root"), null);
});

test("authorize: 401 without role, 403 without permission, next() with it", () => {
  const mw = authorize("order:update", "order:read");
  assert.equal(run(mw, undefined).status, 401);

  const denied = run(mw, "support");
  assert.equal(denied.status, 403);
  assert.deepEqual(denied.body.missing, ["order:update"]);
  assert.equal(denied.nextCalled, false);

  const ok = run(mw, "manager");
  assert.ok(ok.nextCalled);
  assert.equal(ok.req.role, "manager");
});

test("authorize rejects typos at startup", () => {
  assert.throws(() => authorize("order:raed"), /unknown permission/);
});
