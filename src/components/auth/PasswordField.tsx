"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordFieldProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  disabled?: boolean;
  className?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "Password",
  autoComplete = "current-password",
  required,
  minLength,
  disabled,
  className,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-xs font-semibold tracking-wide"
          style={{ color: "var(--c-text-dim)" }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={cn("form-input pr-11")}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition hover:opacity-80"
          style={{ color: "var(--c-text-dim)" }}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
