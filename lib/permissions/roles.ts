import type { Role } from "@/lib/data/models";

export type Permission =
  | "bids.edit"
  | "rules.apply"
  | "clarifications.manage"
  | "approvals.manage"
  | "exports.generate"
  | "comments.add";

const matrix: Record<Role, Permission[]> = {
  Estimator: ["bids.edit", "rules.apply", "clarifications.manage", "exports.generate", "comments.add"],
  Executive: ["approvals.manage", "exports.generate", "comments.add"],
  Viewer: ["exports.generate"],
};

export function can(role: Role, perm: Permission) {
  return matrix[role].includes(perm);
}
