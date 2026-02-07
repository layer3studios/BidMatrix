"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/store/project.store";
import { Button } from "@/components/ui/Button";
import type { VendorTier } from "@/lib/data/models";

export function AddVendorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const addVendor = useProjectStore((s) => s.addVendor);
  
  const [form, setForm] = useState({
      name: "",
      regions: "",
      bonding: "",
      emr: "",
      tier: "New" as VendorTier
  });

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      addVendor({
          name: form.name,
          regions: form.regions.split(",").map(s => s.trim()),
          bonding_limit: parseFloat(form.bonding) || 0,
          safety_emr: parseFloat(form.emr) || 1.0,
          insurance_expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString().split("T")[0], // default 1 yr
          risk_flags: [],
          tier: form.tier
      });
      setForm({ name: "", regions: "", bonding: "", emr: "", tier: "New" });
      onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} 
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl"
          >
            <div className="border-b border-zinc-800 p-4">
                <h3 className="font-semibold text-zinc-100">Add New Vendor</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase text-zinc-500">Company Name</label>
                    <input autoFocus required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase text-zinc-500">Safety EMR</label>
                        <input type="number" step="0.01" value={form.emr} onChange={e => setForm({...form, emr: e.target.value})} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 outline-none" placeholder="1.0" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[11px] uppercase text-zinc-500">Bonding ($)</label>
                        <input type="number" value={form.bonding} onChange={e => setForm({...form, bonding: e.target.value})} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 outline-none" placeholder="1000000" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase text-zinc-500">Regions (comma separated)</label>
                    <input value={form.regions} onChange={e => setForm({...form, regions: e.target.value})} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 outline-none" placeholder="TX, OK, NY" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase text-zinc-500">Tier</label>
                    <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value as VendorTier})} className="w-full rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm focus:border-teal-500 outline-none">
                        <option value="New">New</option>
                        <option value="Approved">Approved</option>
                        <option value="Preferred">Preferred</option>
                        <option value="Watch">Watch</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Create Vendor</Button>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}