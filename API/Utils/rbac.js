// Role-based access control.
// Routes check PERMISSIONS, never role names; roles are just named bundles of permissions.
// To change what a role can do, edit ROLE_PERMISSIONS. To add a role, also add it to the
// `Role` enum in prisma/schema.prisma (and the admin.role ENUM in migrations/add_admin_role.sql).

export const PERMISSIONS = [
  "dashboard:read",
  "catalog:read",
  "catalog:write",
  "order:read",
  "order:update",
  "order:delete",
  "payment:manage",
  "promotion:write",
  "inventory:read",
  "inventory:write",
  "notification:write",
  "review:moderate",
  "chat:manage",
  "staff:manage",
  // customer self-service
  "account:manage",
  "order:create",
  "review:write",
  "chat:use",
];

const SUPPORT = [
  "dashboard:read",
  "catalog:read",
  "order:read",
  "chat:use",
  "chat:manage",
  "review:moderate",
];

const MANAGER = [
  ...SUPPORT,
  "catalog:write",
  "order:update",
  "order:delete",
  "payment:manage",
  "promotion:write",
  "inventory:read",
  "inventory:write",
  "notification:write",
];

export const ROLE_PERMISSIONS = {
  customer: ["account:manage", "order:create", "review:write", "chat:use"],
  support: SUPPORT,
  manager: MANAGER,
  admin: PERMISSIONS.filter((p) => !["account:manage", "order:create", "review:write"].includes(p)),
};

export const ROLES = Object.keys(ROLE_PERMISSIONS);
export const STAFF_ROLES = ["support", "manager", "admin"];

// Tokens issued before RBAC carry numeric roles (1 = admin, 2 = customer).
const LEGACY_ROLES = { 1: "admin", 2: "customer" };

export const normalizeRole = (role) => {
  if (ROLES.includes(role)) return role;
  return LEGACY_ROLES[role] || null;
};

export const permissionsFor = (role) => ROLE_PERMISSIONS[normalizeRole(role)] || [];

export const hasPermission = (role, permission) => permissionsFor(role).includes(permission);

// Role of the caller, as set by validateToken_refresh_token (req.user = { user: { role } }).
export const roleOf = (req) => normalizeRole(req.user?.user?.role);

// Express middleware; must run after validateToken_refresh_token. Requires ALL listed permissions.
// ponytail: role is read from the signed JWT, so a role change applies on next login
// (refresh tokens keep the old role up to their 7-day expiry); look the role up per request if
// staff demotion must be instant.
export const authorize = (...required) => {
  const unknown = required.filter((p) => !PERMISSIONS.includes(p));
  if (unknown.length) throw new Error(`authorize(): unknown permission(s) ${unknown.join(", ")}`);

  return (req, res, next) => {
    const role = roleOf(req);
    if (!role) return res.status(401).json({ message: "Not authenticated" });

    const missing = required.filter((p) => !hasPermission(role, p));
    if (missing.length) {
      return res.status(403).json({ message: "You don't have permission to do this", missing });
    }

    req.role = role;
    return next();
  };
};
