export type Role = "Estimator" | "Executive" | "Viewer";

export type ProjectStatus = "Bidding" | "Leveling" | "Awarding" | "Complete";

export type Project = {
  id: string;
  name: string;
  client: string;
  location: string;
  delivery_method: "GMP" | "Hard Bid" | "CMAR";
  bid_due_date: string; // ISO date
  status: ProjectStatus;
  budget_target: number;
  currency: "USD";
  last_updated: string; // ISO datetime
};

export type BidPackage = {
  id: string;
  projectId: string;
  trade: string;
  package_name: string;
  bid_type: "Hard Bid" | "GMP" | "Budget";
  scope_version: string;
  bid_count: number;
  status: "Intake" | "Leveling" | "Clarifications" | "Ready" | "Awarded";
  estimated_value: number;
};

export type VendorTier = "Preferred" | "Approved" | "New" | "Watch";

export type Vendor = {
  id: string;
  name: string;
  regions: string[];
  bonding_limit: number;
  safety_emr: number;
  insurance_expiry: string; // ISO date
  risk_flags: string[];
  tier: VendorTier;
};
