"use client";

import { useState } from "react";
import { CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import { serviceOptions } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

type FormData = {
  fullName: string; email: string; company: string; website: string;
  country: string; industry: string; requiredService: string;
  currentProblem: string; projectDetails: string; expectedGoal: string;
  budget: string; deadline: string; services: string[];
};

const init: FormData = {
  fullName: "", email: "", company: "", website: "", country: "", industry: "",
  requiredService: "", currentProblem: "", projectDetails: "", expectedGoal: "",
  budget: "", deadline: "", services: [],
};

export function ClientRequirementForm() {
  const [form, setForm] = useState<FormData>(init);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof FormData, v: string | string[]) => setForm((p) => ({ ...p, [k]: v }));
  const toggle = (s: string) => set("services", form.services.includes(s) ? form.services.filter((x) => x !== s) : [...form.services, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 text-teal-500" size={48} />
        <h3 className="font-[var(--font-space)] text-xl font-bold" style={{ color: "var(--c-heading)" }}>Inquiry Sent!</h3>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>Thanks {form.fullName || "there"}, we will respond within 24 hours.</p>
        <button
          type="button"
          onClick={() => { setForm(init); setStatus("idle"); }}
          className="mt-6 text-sm font-semibold text-indigo-500 hover:text-teal-500 transition"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === "error" && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
          <AlertCircle size={16} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {([
          ["fullName", "Full Name *", "John Doe"],
          ["email", "Business Email *", "john@company.com", "email"],
          ["company", "Company Name *", "Your Company"],
          ["website", "Website", "https://"],
          ["country", "Country *", "United States"],
          ["industry", "Industry *", "E-commerce"],
        ] as const).map(([key, label, ph, type]) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>{label}</label>
            <input
              required={!ph.startsWith("https")}
              type={type ?? "text"}
              className="form-input"
              placeholder={ph}
              value={form[key as keyof FormData] as string}
              onChange={(e) => set(key as keyof FormData, e.target.value)}
              disabled={status === "loading"}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>Required Service *</label>
        <select required className="form-input" value={form.requiredService} onChange={(e) => set("requiredService", e.target.value)} disabled={status === "loading"}>
          <option value="" style={{ background: "var(--c-select-bg)" }}>Select a service</option>
          {serviceOptions.map((s) => <option key={s} value={s} style={{ background: "var(--c-select-bg)" }}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>Services Interested In</label>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((s) => (
            <label key={s} className="flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs transition-all has-[:checked]:bg-indigo-500/10 has-[:checked]:text-indigo-500" style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}>
              <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggle(s)} className="accent-indigo-500" disabled={status === "loading"} />
              {s}
            </label>
          ))}
        </div>
      </div>

      {([
        ["currentProblem", "Current Problem *", 3, "Describe your challenge..."],
        ["projectDetails", "Project Details *", 4, "Scope and requirements..."],
        ["expectedGoal", "Expected Goal *", 2, "Desired outcome..."],
      ] as const).map(([key, label, rows, ph]) => (
        <div key={key}>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>{label}</label>
          <textarea required rows={rows} className="form-input resize-none" placeholder={ph} value={form[key]} onChange={(e) => set(key, e.target.value)} disabled={status === "loading"} />
        </div>
      ))}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>Budget (Optional)</label>
          <input className="form-input" placeholder="$500 - $2000" value={form.budget} onChange={(e) => set("budget", e.target.value)} disabled={status === "loading"} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>Deadline (Optional)</label>
          <input className="form-input" placeholder="2 weeks" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} disabled={status === "loading"} />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "loading"}>
        {status === "loading" ? (
          <><Loader2 size={16} className="animate-spin" /> Sending...</>
        ) : (
          <><Send size={16} /> Send Inquiry</>
        )}
      </Button>
    </form>
  );
}
