# BidMatrix Leveling Drawer Components

## Table of Contents

- [Project Overview](#project-overview)
- [Target Audience](#target-audience)
- [Drawer System Architecture](#drawer-system-architecture)
- [Component-by-Component Breakdown](#component-by-component-breakdown)
  - [AuditTimeline.tsx](#audittimelinetsx)
  - [BidderProfile.tsx](#bidderprofiletsx)
  - [ScopeDetail.tsx](#scopedetailtsx)
- [Drawer Tabs and Features](#drawer-tabs-and-features)
  - [Bidder 360 Tab](#bidder-360-tab)
  - [Scope Item Tab](#scope-item-tab)
  - [Variance Tab](#variance-tab)
  - [Docs Tab](#docs-tab)
  - [Audit Tab](#audit-tab)
- [User Experience Flow](#user-experience-flow)
- [MVP (Minimum Viable Product)](#mvp-minimum-viable-product)
- [Future Enhancements](#future-enhancements)
- [Conclusion](#conclusion)

---

## Project Overview

BidMatrix is a modern, web-based platform for bid leveling and comparison, primarily used in construction, engineering, and procurement. The **leveling drawer** is a dynamic, context-sensitive panel that provides users with detailed information and actions related to bidders, scope items, variances, documents, and audit history. This system is designed to streamline the bid evaluation process, improve transparency, and enhance decision-making.

---

## Target Audience

- **Estimators**: Need to compare and analyze multiple bids efficiently.
- **Project Managers**: Require detailed breakdowns and audit trails for compliance and review.
- **Procurement Teams**: Manage bid documentation and ensure process transparency.
- **Executives/Stakeholders**: Need high-level insights and traceability for decision-making.

---

## Drawer System Architecture

The drawer is a right-side sliding panel, implemented as a React component (`RightDrawer.tsx`). It is controlled by a global store (`useLevelingStore`) and can be toggled open or closed. The drawer contains a tab navigation system, and its content area dynamically renders one of several feature components based on the selected tab and context (such as selected bidder or scope item).

**Key architectural features:**
- **Contextual Rendering:** Only relevant information is shown based on user selection.
- **Tab Navigation:** Users can switch between different feature views.
- **Empty States:** Informative messages guide users when required context is missing.
- **Component Modularity:** Each feature is encapsulated in its own file for maintainability.

---

## Component-by-Component Breakdown

### AuditTimeline.tsx

**Purpose:**  
Displays a chronological list of actions and changes (audit events) related to the current bid or scope item.

**Features:**
- Fetches and displays audit events (e.g., edits, comments, approvals).
- Each event typically includes a timestamp, user, and description of the action.
- May support filtering by event type or user in future versions.

**How it works:**  
When the "Audit" tab is selected, this component is rendered. It receives context (such as the current scope or bidder) and queries the audit log for relevant events.

**Benefits:**  
Ensures accountability, supports compliance, and provides a transparent history of changes.

---

### BidderProfile.tsx

**Purpose:**  
Shows a comprehensive profile of the selected bidder.

**Features:**
- Displays bidder name, company info, contact details, and bid summary.
- May include bid-specific notes, compliance status, and risk flags.
- Can be extended to show historical performance or references.

**How it works:**  
When a bidder is selected and the "Bidder 360" tab is active, this component fetches and displays the bidder's details.

**Benefits:**  
Allows users to quickly assess and compare bidders, supporting informed selection.

---

### ScopeDetail.tsx

**Purpose:**  
Provides detailed information about a specific scope item, optionally in the context of a selected bidder.

**Features:**
- Shows scope description, quantities, unit pricing, and total cost.
- If a bidder is selected, displays their specific values for the scope.
- May include comparison with other bidders or historical data.

**How it works:**  
When a scope row is selected and the "Scope Item" or "Variance" tab is active, this component renders the relevant details.

**Benefits:**  
Facilitates granular comparison and helps identify discrepancies or opportunities for value engineering.

---

## Drawer Tabs and Features

### Bidder 360 Tab

- **Component:** `BidderProfile.tsx`
- **Function:** Presents a 360-degree view of the selected bidder.
- **Features:**
  - Bidder identity and contact info.
  - Bid summary and compliance status.
  - Notes and risk indicators.
- **Empty State:** Prompts user to select a bidder if none is selected.

---

### Scope Item Tab

- **Component:** `ScopeDetail.tsx`
- **Function:** Shows detailed information for the selected scope item.
- **Features:**
  - Scope description, quantities, and pricing.
  - Bidder-specific values if a bidder is selected.
- **Empty State:** Prompts user to select a scope row if none is selected.

---

### Variance Tab

- **Component:** `ScopeDetail.tsx` (with comparison logic)
- **Function:** Highlights differences between bidders for a given scope item.
- **Features:**
  - Comparison of unit rates, totals, and notes across bidders.
  - Visual indicators for significant variances.
- **Empty State:** Prompts user to select both a scope row and a bidder.

---

### Docs Tab

- **Component:** Inline in `RightDrawer.tsx`
- **Function:** Lists and previews uploaded documents related to the bid or scope.
- **Features:**
  - Displays document type (PDF, XLS, etc.), name, and upload date.
  - May support download, preview, or upload actions in future.
- **Empty State:** Not applicable; always shows at least the document list.

---

### Audit Tab

- **Component:** `AuditTimeline.tsx`
- **Function:** Shows a timeline of all actions and changes for the current context.
- **Features:**
  - Chronological list of audit events.
  - May include filtering and search in future.
- **Empty State:** Shows message if no audit events are available.

---

## User Experience Flow

1. **User opens the leveling interface.**
2. **User selects a bidder or scope row in the main grid.**
3. **Drawer opens automatically or via user action.**
4. **Tabs at the top allow switching between Bidder 360, Scope Item, Variance, Docs, and Audit.**
5. **Content area updates based on selected tab and context.**
6. **Empty states guide the user if required context is missing.**
7. **User can close the drawer at any time to return to the main grid.**

---

## MVP (Minimum Viable Product)

- **Drawer UI:** Responsive, animated right-side panel.
- **Tab Navigation:** Switch between all five feature tabs.
- **Bidder Profile:** Show basic bidder info.
- **Scope Detail:** Show scope item details and bidder-specific values.
- **Variance:** Highlight differences for selected cell.
- **Docs:** List uploaded documents.
- **Audit Timeline:** Show recent actions.
- **Empty States:** Informative prompts for missing context.
- **Consistent Styling:** Tailwind CSS for modern, accessible UI.

---

## Future Enhancements

- **Document Upload/Download:** Allow users to manage documents directly from the drawer.
- **Advanced Audit Filtering:** Search and filter audit events by type, user, or date.
- **Interactive Variance Analysis:** Visual charts and deeper comparison tools.
- **Customizable Drawer:** Users can configure which tabs are visible.
- **Notifications & Alerts:** Integrate with system notifications for real-time updates.
- **Role-Based Views:** Tailor drawer content based on user roles (e.g., estimator, manager).

---

## Conclusion

The `drawer` folder encapsulates the core contextual features of the BidMatrix leveling experience. Each component is designed for modularity, clarity, and extensibility, ensuring that users have immediate access to the information and actions they need. This system supports efficient, transparent, and data-driven bid evaluation for all stakeholders involved in complex procurement and construction projects.

