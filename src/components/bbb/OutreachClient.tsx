"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

function clean(value: string, fallback: string) {
  const t = value.trim();
  return t || fallback;
}

function generate(kind: string, data: {
  businessName: string;
  category: string;
  city: string;
  senderName: string;
}) {
  const name = clean(data.businessName, "there");
  const category = clean(data.category, "your industry");
  const location = clean(data.city, "your area");
  const sender = clean(data.senderName, "AxenFlow AI");

  if (kind === "phone_script") {
    return {
      subject: `Call script: ${name}`,
      body:
        `Hi there, this is [Your Name] with ${sender}. ` +
        `I'll keep it brief. I work with ${category} companies around ${location}. ` +
        `We help teams like ${name} fill their pipeline with verified local leads. ` +
        `Do you have 30 seconds, or should I try you later?`,
    };
  }

  if (kind === "follow_up") {
    return {
      subject: `Following up: ${name}`,
      body:
        `Hello ${name} team,\n\n` +
        `Just bumping this in case my last note got buried. ` +
        `Happy to share a sample of verified leads for your market, no obligation.\n\n` +
        `Worth a quick reply?\n\n` +
        `Best regards,\n${sender}`,
    };
  }

  return {
    subject: `Quick idea for ${name} in ${location}`,
    body:
      `Hello ${name} team,\n\n` +
      `I help ${category} businesses in ${location} get more qualified leads without adding headcount.\n\n` +
      `We built a short system that finds ready-to-buy prospects and drafts outreach so your team can focus on closing.\n\n` +
      `Open to a 10-minute call this week to see if it's a fit?\n\n` +
      `Best regards,\n${sender}`,
  };
}

export function OutreachClient() {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [senderName, setSenderName] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("axenflow-sender-name");
      if (saved) setSenderName(saved);
    } catch (_) {}
  }, []);

  function run(kind: string) {
    try {
      localStorage.setItem("axenflow-sender-name", senderName.trim());
    } catch (_) {}
    const result = generate(kind, { businessName, category, city, senderName });
    setOutput(`Subject: ${result.subject}\n\n${result.body}`);
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
          Lead / company
        </span>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Acme Plumbing"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--c-border)",
            background: "var(--c-hover-bg)",
            color: "var(--c-heading)",
          }}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
          Category
        </span>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Plumber"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--c-border)",
            background: "var(--c-hover-bg)",
            color: "var(--c-heading)",
          }}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
          City / location
        </span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Houston, TX"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--c-border)",
            background: "var(--c-hover-bg)",
            color: "var(--c-heading)",
          }}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--c-heading)" }}>
          Your business name (Best regards)
        </span>
        <input
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="e.g. AxenFlow AI, Your Company LLC"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--c-border)",
            background: "var(--c-hover-bg)",
            color: "var(--c-heading)",
          }}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => run("cold_email")} variant="green">
          Cold email
        </Button>
        <Button type="button" onClick={() => run("phone_script")} variant="outline">
          Phone script
        </Button>
        <Button type="button" onClick={() => run("follow_up")} variant="outline">
          Follow-up
        </Button>
      </div>

      <textarea
        readOnly
        value={output}
        placeholder="Generated copy appears here..."
        rows={12}
        className="w-full rounded-xl px-4 py-3 font-mono text-sm outline-none"
        style={{
          border: "1px solid var(--c-border)",
          background: "var(--c-hover-bg)",
          color: "var(--c-heading)",
        }}
      />
    </div>
  );
}
