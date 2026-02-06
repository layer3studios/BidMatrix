import type { BidPackage, Project, Vendor } from "./models";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
const int = (r: () => number, min: number, max: number) => Math.floor(r() * (max - min + 1)) + min;

export function generateSeedData(seed = 20260206) {
  const r = mulberry32(seed);

  const projects: Project[] = [
    {
      id: "PRJ-2026-001",
      name: "Riverview Medical Pavilion",
      client: "Northlake Health Group",
      location: "Austin, TX",
      delivery_method: "GMP",
      bid_due_date: "2026-02-20",
      status: "Bidding",
      budget_target: 48250000,
      currency: "USD",
      last_updated: "2026-02-05T10:20:00Z",
    },
    {
      id: "PRJ-2026-002",
      name: "Sundown Logistics Hub",
      client: "Westline Industrial REIT",
      location: "Dallas, TX",
      delivery_method: "CMAR",
      bid_due_date: "2026-03-06",
      status: "Leveling",
      budget_target: 76500000,
      currency: "USD",
      last_updated: "2026-02-04T15:05:00Z",
    },
  ];

  const trades = ["MEP", "Electrical", "Plumbing", "Steel", "Concrete", "Drywall", "Fireproofing"];
  const packageNames = [
    "HVAC + Controls",
    "Electrical Distribution",
    "Plumbing + Med Gas",
    "Structural Steel",
    "Cast-in-Place Concrete",
    "Drywall + ACT",
  ];

  const packages: BidPackage[] = Array.from({ length: 12 }).map((_, i) => {
    const projectId = pick(r, projects).id;
    const trade = pick(r, trades);
    return {
      id: `PKG-${String(i + 1).padStart(3, "0")}`,
      projectId,
      trade,
      package_name: pick(r, packageNames),
      bid_type: pick(r, ["Hard Bid", "GMP", "Budget"]),
      scope_version: `v${int(r, 1, 4)}`,
      bid_count: int(r, 3, 9),
      status: pick(r, ["Intake", "Leveling", "Clarifications", "Ready"]),
      estimated_value: int(r, 600000, 9500000),
    };
  });

  const vendorNames = [
    "Summit Mechanical Contractors",
    "BlueRiver Electric",
    "IronPeak Steel",
    "Redline Plumbing",
    "Canyon Concrete",
    "Northstar Drywall",
    "Evergreen Fireproofing",
  ];

  const vendors: Vendor[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `VND-${String(i + 1).padStart(3, "0")}`,
    name: vendorNames[i % vendorNames.length] + (i > 6 ? ` (${i + 1})` : ""),
    regions: pick(r, [["TX"], ["TX", "OK"], ["TX", "LA"], ["TX", "NM"]]),
    bonding_limit: int(r, 2500000, 20000000),
    safety_emr: Math.round((0.75 + r() * 0.55) * 100) / 100,
    insurance_expiry: `2026-${String(int(r, 3, 12)).padStart(2, "0")}-${String(int(r, 1, 28)).padStart(2, "0")}`,
    risk_flags: Array.from({ length: int(r, 0, 3) }).map(() =>
      pick(r, ["Capacity Tight", "Insurance Expiring Soon", "High EMR", "Limited Regions", "Prior Claims"]),
    ),
    tier: pick(r, ["Preferred", "Approved", "New", "Watch"]),
  }));

  return { projects, packages, vendors };
}
