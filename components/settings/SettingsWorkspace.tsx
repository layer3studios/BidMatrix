"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore, type Integration } from "@/store/settings.store";
import { useLevelingStore } from "@/store/leveling.store"; // For Audit Logs
import { Button } from "@/components/ui/Button";

// --- Types ---
type SettingsTab = "general" | "team" | "notifications" | "integrations" | "security" | "billing";

const TABS: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "team", label: "Team & Roles", icon: "👥" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "integrations", label: "Integrations", icon: "🔌" },
  { id: "security", label: "Security & Audit", icon: "🛡️" },
  { id: "billing", label: "Plan & Billing", icon: "💳" },
];

export function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="flex h-full min-h-0 bg-zinc-950">
      {/* Sidebar Nav */}
      <div className="w-64 shrink-0 border-r border-zinc-800/70 bg-zinc-950/50 p-4">
        <div className="mb-6 px-2">
          <div className="text-sm font-semibold text-zinc-100">Organization Settings</div>
          <div className="text-[11px] text-zinc-500">Manage your company workspace</div>
        </div>
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-zinc-800 text-zinc-100 shadow-sm ring-1 ring-zinc-700"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <span className="opacity-70">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 overflow-y-auto bg-zinc-950/20">
        <div className="mx-auto max-w-4xl p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "general" && <GeneralSection />}
            {activeTab === "team" && <TeamSection />}
            {activeTab === "integrations" && <IntegrationsSection />}
            {activeTab === "security" && <SecuritySection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "billing" && <BillingSection />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-SECTIONS ---

function GeneralSection() {
  const { companyName, supportEmail, workspaceSlug, updateProfile } = useSettingsStore();
  const pushToast = useLevelingStore((s) => s.pushToast); // Reuse existing toast system

  const [form, setForm] = useState({ companyName, supportEmail, workspaceSlug });

  const handleSave = () => {
    updateProfile(form);
    pushToast({ title: "Settings saved", detail: "General profile updated successfully.", tone: "success" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-zinc-100">General Settings</h2>
        <p className="text-sm text-zinc-500">Configure your company profile and default standards.</p>
      </div>

      <div className="grid gap-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Company Name</label>
            <input 
                type="text" 
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500/50 focus:outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Support Email</label>
            <input 
                type="email" 
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-teal-500/50 focus:outline-none" 
            />
          </div>
        </div>
        
        <div className="space-y-2">
            <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Workspace URL</label>
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                <span className="text-sm text-zinc-500">bidmatrix.app/</span>
                <input 
                    type="text" 
                    value={form.workspaceSlug}
                    onChange={(e) => setForm({ ...form, workspaceSlug: e.target.value })}
                    className="ml-1 flex-1 bg-transparent text-sm text-zinc-200 focus:outline-none" 
                />
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setForm({ companyName, supportEmail, workspaceSlug })}>Reset</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

function TeamSection() {
  const { team, removeMember, updateMemberRole, inviteMember } = useSettingsStore();
  const [isInviting, setIsInviting] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const handleInvite = () => {
      if(!newEmail || !newName) return;
      inviteMember(newName, newEmail, "Viewer");
      setNewName("");
      setNewEmail("");
      setIsInviting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
            <h2 className="text-lg font-medium text-zinc-100">Team Management</h2>
            <p className="text-sm text-zinc-500">Manage access and roles for your workspace.</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsInviting(!isInviting)}>
            {isInviting ? "Cancel" : "+ Invite Member"}
        </Button>
      </div>

      {isInviting && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
              <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500">Name</label>
                      <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-sm" placeholder="John Doe" />
                  </div>
                  <div className="flex-1 space-y-1">
                      <label className="text-[10px] uppercase text-zinc-500">Email</label>
                      <input value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full rounded bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-sm" placeholder="john@company.com" />
                  </div>
                  <Button variant="primary" onClick={handleInvite}>Send Invite</Button>
              </div>
          </motion.div>
      )}

      <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/20">
        <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/50 text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Last Active</th>
                    <th className="px-4 py-3 font-medium"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
                {team.map((u) => (
                    <tr key={u.id} className="group hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-3">
                            <div className="font-medium text-zinc-200">{u.name}</div>
                            <div className="text-[11px] text-zinc-500">{u.email}</div>
                        </td>
                        <td className="px-4 py-3">
                            <select 
                                value={u.role} 
                                onChange={(e) => updateMemberRole(u.id, e.target.value as any)}
                                className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-[11px] text-zinc-300 focus:outline-none focus:border-teal-500/50"
                            >
                                <option>Admin</option>
                                <option>Estimator</option>
                                <option>Viewer</option>
                            </select>
                        </td>
                        <td className="px-4 py-3">
                            <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                                u.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                            )}>
                                {u.status}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right text-zinc-500">{u.lastActive}</td>
                        <td className="px-4 py-3 text-right">
                            <button onClick={() => removeMember(u.id)} className="text-zinc-600 hover:text-rose-400 transition-colors">Remove</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsSection() {
    const { integrations, toggleIntegration } = useSettingsStore();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-zinc-100">Integrations</h2>
                <p className="text-sm text-zinc-500">Connect BidMatrix to your construction technology stack.</p>
            </div>

            <div className="grid gap-4">
                {integrations.map(i => (
                    <IntegrationCard key={i.id} data={i} onToggle={() => toggleIntegration(i.id)} />
                ))}
            </div>
        </div>
    )
}

function IntegrationCard({ data, onToggle }: { data: Integration; onToggle: () => void }) {
    const [localLoading, setLocalLoading] = useState(false);

    const handleClick = async () => {
        setLocalLoading(true);
        // We know the store action is async and waits 1.5s
        // But we need to handle the visual state here if we want to override the store's "connecting" status if needed
        // For now, rely on store state if mapped correctly. 
        // NOTE: Our store logic mapping is tricky with the toggle. Let's trust the UI re-render.
        // Actually, the store updates status to "connecting" immediately.
        await onToggle();
        setLocalLoading(false);
    };

    const isConnected = data.status === "connected";
    const isConnecting = data.status === "connecting" || localLoading;

    return (
        <div className="flex items-start gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/40">
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white", data.color)}>
                {data.logo}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                    <div className="font-medium text-zinc-200">{data.name}</div>
                    {isConnected ? (
                        <button onClick={handleClick} className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected
                        </button>
                    ) : (
                        <Button 
                            variant={isConnecting ? "ghost" : "secondary"} 
                            size="sm" 
                            className="h-7 text-[11px]" 
                            disabled={isConnecting}
                            onClick={handleClick}
                        >
                            {isConnecting ? "Connecting..." : "Connect"}
                        </Button>
                    )}
                </div>
                <div className="mt-1 text-sm text-zinc-500">{data.description}</div>
            </div>
        </div>
    )
}

function SecuritySection() {
    const { enforce2FA, toggle2FA } = useSettingsStore();
    // Pull real audit logs from our Leveling store
    const auditEvents = useLevelingStore((s) => s.auditEvents);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-medium text-zinc-100">Security & Audit Log</h2>
                <p className="text-sm text-zinc-500">Monitor sensitive actions and manage authentication standards.</p>
            </div>

            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-zinc-200">Enforce Two-Factor Authentication</div>
                        <div className="text-sm text-zinc-500">Require 2FA for all estimators and admins.</div>
                    </div>
                    <button 
                        onClick={toggle2FA}
                        className={cn("h-6 w-11 rounded-full p-1 transition-colors", enforce2FA ? "bg-teal-500/20 ring-1 ring-teal-500/50" : "bg-zinc-700")}
                    >
                        <div className={cn("h-4 w-4 rounded-full transition-transform", enforce2FA ? "bg-teal-400 translate-x-5" : "bg-zinc-400 translate-x-0")} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="text-sm font-semibold text-zinc-200">Global Audit Log</div>
                <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/20">
                    {auditEvents.length === 0 ? (
                        <div className="p-8 text-center text-sm text-zinc-500">No activity recorded in this session yet.</div>
                    ) : (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900/50 text-[10px] uppercase tracking-wider text-zinc-500">
                                <tr>
                                    <th className="px-4 py-2">Time</th>
                                    <th className="px-4 py-2">User</th>
                                    <th className="px-4 py-2">Action</th>
                                    <th className="px-4 py-2">Resource</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-[12px] text-zinc-400">
                                {auditEvents.map((ev) => (
                                    <tr key={ev.id}>
                                        <td className="px-4 py-2 font-mono">{new Date(ev.ts).toLocaleTimeString()}</td>
                                        <td className="px-4 py-2 text-zinc-300">{ev.actor}</td>
                                        <td className="px-4 py-2">{ev.action.replace(/_/g, " ")}</td>
                                        <td className="px-4 py-2 font-mono text-zinc-500">{ev.bidderId || ev.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

function NotificationsSection() {
    const { notifications, toggleNotification } = useSettingsStore();
    const config = [
        { key: "bid_submit", label: "Bid Submitted by Vendor" },
        { key: "clarification", label: "Clarification Reply Received" },
        { key: "budget_alert", label: "Budget Exceeded Alert" },
        { key: "daily_digest", label: "Daily Digest" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-zinc-100">Notifications</h2>
                <p className="text-sm text-zinc-500">Choose how and when you want to be alerted.</p>
            </div>
            
            <div className="space-y-4">
                {config.map((item) => {
                    const pref = notifications[item.key] || { email: false, inApp: false };
                    return (
                        <div key={item.key} className="flex items-center justify-between border-b border-zinc-800/50 pb-4 last:border-0">
                            <div className="text-sm text-zinc-300">{item.label}</div>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={pref.email} 
                                        onChange={() => toggleNotification(item.key, "email")}
                                        className="rounded border-zinc-800 bg-zinc-900 accent-teal-500" 
                                    /> Email
                                </label>
                                <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={pref.inApp} 
                                        onChange={() => toggleNotification(item.key, "inApp")}
                                        className="rounded border-zinc-800 bg-zinc-900 accent-teal-500" 
                                    /> In-App
                                </label>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

function BillingSection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-zinc-100">Plan & Billing</h2>
                <p className="text-sm text-zinc-500">Enterprise License managed by Acme Corp.</p>
            </div>

            <div className="rounded-xl bg-linear-to-br from-teal-900/20 to-zinc-900 border border-teal-500/20 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-teal-400">Current Plan</div>
                        <div className="mt-1 text-2xl font-bold text-white">Enterprise Scale</div>
                    </div>
                    <div className="rounded bg-teal-500/20 px-2 py-1 text-xs font-bold text-teal-300">Active</div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-6">
                    <div>
                        <div className="text-[11px] text-zinc-400">Seats Used</div>
                        <div className="mt-1 text-lg font-medium text-zinc-200">14 / 20</div>
                        <div className="mt-1 h-1 w-full rounded-full bg-zinc-800">
                            <div className="h-1 w-[70%] rounded-full bg-teal-500" />
                        </div>
                    </div>
                    <div>
                        <div className="text-[11px] text-zinc-400">Storage</div>
                        <div className="mt-1 text-lg font-medium text-zinc-200">450 GB</div>
                    </div>
                    <div>
                        <div className="text-[11px] text-zinc-400">Next Invoice</div>
                        <div className="mt-1 text-lg font-medium text-zinc-200">April 1, 2026</div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3">
                <Button variant="secondary">Manage Payment Method</Button>
                <Button variant="ghost">View Invoices</Button>
            </div>
        </div>
    )
}