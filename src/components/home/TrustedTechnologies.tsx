"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Zap, Link2, Code2, MessageCircle, Hash, Database, Cloud, Workflow } from "lucide-react";
import { Section } from "@/components/ui/Section";

const tools = [
  { name: "OpenAI", Icon: Bot, color: "#10b981" },
  { name: "Claude", Icon: Brain, color: "#f97316" },
  { name: "n8n", Icon: Zap, color: "#ef4444" },
  { name: "Make", Icon: Link2, color: "#8b5cf6" },
  { name: "Python", Icon: Code2, color: "#eab308" },
  { name: "LangChain", Icon: MessageCircle, color: "#22c55e" },
  { name: "Slack", Icon: Hash, color: "#38bdf8" },
  { name: "Airtable", Icon: Database, color: "#6366f1" },
  { name: "Zapier", Icon: Workflow, color: "#f59e0b" },
  { name: "Supabase", Icon: Cloud, color: "#3ecf8e" },
];

export function TrustedTechnologies() {
  return (
    <Section className="!py-16 lg:!py-20" divider>
      <div className="text-center mb-12">
        <h2 className="font-[var(--font-space)] text-2xl font-bold sm:text-3xl" style={{ color: "var(--c-heading)" }}>
          Tools We Work With
        </h2>
        <p className="mt-3 text-sm" style={{ color: "var(--c-text-muted)" }}>
          We pick the best tool for your project, not the trendiest one.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className="group relative overflow-hidden rounded-2xl border px-4 py-6 text-center transition-all duration-300 hover:scale-[1.04]"
            style={{
              borderColor: `${tool.color}25`,
              background: `linear-gradient(to bottom, ${tool.color}12, transparent)`,
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30` }}
            >
              <tool.Icon size={22} style={{ color: tool.color }} strokeWidth={1.8} />
            </div>
            <p className="font-[var(--font-space)] text-sm font-semibold" style={{ color: tool.color }}>
              {tool.name}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
