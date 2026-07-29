import Image from "next/image";
import Link from "next/link";
import { Clock3, ExternalLink, ImageIcon, Video } from "lucide-react";
import type { PortfolioProject } from "@/lib/portfolio";
import { caseStudyRequestHref } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

type PortfolioCardProps = {
  project: PortfolioProject;
  /** Homepage cards use taller cover + lift animation. */
  variant?: "home" | "page";
  className?: string;
};

function ProofBlock({ project }: { project: PortfolioProject }) {
  const hasAsset =
    project.proof_type !== "none_yet" && Boolean(project.proof_asset?.trim());

  if (hasAsset && project.proof_type === "video") {
    return (
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--c-border)" }}
      >
        <video
          className="aspect-video w-full bg-black/40 object-cover"
          controls
          preload="metadata"
          src={project.proof_asset}
        >
          Your browser does not support the video tag.
        </video>
        <p
          className="flex items-center gap-1.5 px-3 py-2 text-[11px]"
          style={{ color: "var(--c-text-muted)", background: "var(--c-hover-bg)" }}
        >
          <Video size={12} className="shrink-0 text-indigo-500" />
          Client deliverable walkthrough
        </p>
      </div>
    );
  }

  if (hasAsset) {
    return (
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--c-border)" }}
      >
        <div className="relative aspect-[16/10] w-full">
          <Image
            src={project.proof_asset}
            alt={`${project.title} proof`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-top"
          />
        </div>
        <p
          className="flex items-center gap-1.5 px-3 py-2 text-[11px]"
          style={{ color: "var(--c-text-muted)", background: "var(--c-hover-bg)" }}
        >
          <ImageIcon size={12} className="shrink-0 text-indigo-500" />
          {project.proof_type === "written_permission_quote"
            ? "Shared with client permission"
            : "Project screenshot"}
        </p>
      </div>
    );
  }

  return null;
}

function StoryLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
      <span className="font-semibold" style={{ color: "var(--c-heading)" }}>
        {label}:{" "}
      </span>
      {text}
    </p>
  );
}

export function PortfolioCard({ project, variant = "page", className }: PortfolioCardProps) {
  const isHome = variant === "home";

  return (
    <article
      className={cn(
        "glass-card group flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300",
        isHome ? "home-hover-lift" : "hover:scale-[1.02]",
        className
      )}
    >
      {project.cover_image ? (
        <div className={cn("relative shrink-0 overflow-hidden", isHome ? "h-44 sm:h-52" : "h-28 sm:h-32")}>
          <Image
            src={project.cover_image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={65}
            className={cn(
              "object-cover",
              !isHome && "transition-transform duration-500 group-hover:scale-105"
            )}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background: isHome
                ? "linear-gradient(to top, var(--c-bg), transparent)"
                : "linear-gradient(to top, var(--c-bg), transparent 65%)",
            }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-indigo-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white sm:text-xs">
              {project.industry}
            </span>
            {project.timeline ? (
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold sm:text-xs"
                style={{ background: "var(--c-surface)", color: "var(--c-text-dim)", border: "1px solid var(--c-border)" }}
              >
                <Clock3 size={11} className="text-indigo-500" />
                {project.timeline}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div>
          {isHome ? (
            <h3
              className="font-[var(--font-space)] text-base font-bold"
              style={{ color: "var(--c-heading)" }}
            >
              {project.title}
            </h3>
          ) : (
            <h2
              className="font-[var(--font-space)] text-base font-bold sm:text-lg"
              style={{ color: "var(--c-heading)" }}
            >
              {project.title}
            </h2>
          )}
          <p className="mt-1 text-xs" style={{ color: "var(--c-text-muted)" }}>
            {project.client_name}
          </p>
        </div>

        <div className="space-y-2">
          <StoryLine label="Problem" text={project.problem} />
          <StoryLine label="Solution" text={project.solution} />
          <StoryLine label="Result" text={project.result} />
        </div>

        <ProofBlock project={project} />

        {project.tech_stack?.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <li
                key={tech}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium sm:text-[11px]"
                style={{
                  background: "var(--c-hover-bg)",
                  color: "var(--c-text-dim)",
                  border: "1px solid var(--c-border)",
                }}
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          <Link
            href={caseStudyRequestHref(project.title)}
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300 active:scale-[0.97] sm:flex-none"
          >
            Request full case study
          </Link>
          {project.project_url ? (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:opacity-80"
              style={{ color: "var(--c-text-dim)" }}
            >
              <ExternalLink size={14} />
              View
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
