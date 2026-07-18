"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Loader2, Save, Shield, Trash2 } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  email: string;
  company: string;
  country: string;
  notifyProduct: boolean;
  notifyMarketing: boolean;
  role: string;
  hasPassword: boolean;
  createdAt: string;
};

export function ProfileSettingsForm() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [country, setCountry] = useState("");
  const [notifyProduct, setNotifyProduct] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (!res.ok) {
          if (!cancelled) setError(data.error || "Could not load profile.");
          return;
        }
        if (cancelled) return;
        setProfile(data);
        setName(data.name || "");
        setCompany(data.company || "");
        setCountry(data.country || "");
        setNotifyProduct(Boolean(data.notifyProduct));
        setNotifyMarketing(Boolean(data.notifyMarketing));
      } catch {
        if (!cancelled) setError("Network error while loading profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          country,
          notifyProduct,
          notifyMarketing,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save profile.");
        return;
      }
      setProfile((prev) => (prev ? { ...prev, ...data.profile } : data.profile));
      await update({ name: data.profile.name });
      setMessage("Profile saved successfully.");
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage("");
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    setChangingPw(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Could not change password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwMessage("Password updated successfully.");
    } catch {
      setPwError("Network error while changing password.");
    } finally {
      setChangingPw(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? Saved leads, history, and exports will be removed. This cannot be undone."
    );
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not delete account.");
        setDeleting(false);
        return;
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Network error while deleting account.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
        <Loader2 size={16} className="animate-spin" /> Loading profile…
      </div>
    );
  }

  if (!profile) {
    return <p className="text-sm text-red-500">{error || "Profile unavailable."}</p>;
  }

  const inputClass = "form-input";
  const cardStyle = { border: "1px solid var(--c-border)" as const };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <form onSubmit={saveProfile} className="glass-card rounded-2xl p-6 space-y-5" style={cardStyle}>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
            Profile
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
            Update how your account appears across AxenFlow AI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={profile.email} disabled readOnly />
          </Field>
          <Field label="Company">
            <input
              className={inputClass}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
            />
          </Field>
          <Field label="Country">
            <input
              className={inputClass}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl p-3" style={{ background: "var(--c-hover-bg)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-dim)" }}>
              Role
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-heading)" }}>{profile.role}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--c-hover-bg)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--c-text-dim)" }}>
              Member since
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--c-heading)" }}>
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--c-heading)" }}>
            Notifications
          </p>
          <label className="flex items-start gap-3 text-sm" style={{ color: "var(--c-text-muted)" }}>
            <input
              type="checkbox"
              className="mt-0.5 accent-indigo-500"
              checked={notifyProduct}
              onChange={(e) => setNotifyProduct(e.target.checked)}
            />
            Product updates (new features, tool releases)
          </label>
          <label className="flex items-start gap-3 text-sm" style={{ color: "var(--c-text-muted)" }}>
            <input
              type="checkbox"
              className="mt-0.5 accent-indigo-500"
              checked={notifyMarketing}
              onChange={(e) => setNotifyMarketing(e.target.checked)}
            />
            Marketing emails (tips, offers)
          </label>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {message && <p className="text-sm text-teal-500">{message}</p>}

        <button type="submit" disabled={saving} className="btn-main inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save profile
        </button>
      </form>

      {profile.hasPassword && (
        <form onSubmit={changePassword} className="glass-card rounded-2xl p-6 space-y-5" style={cardStyle}>
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
            >
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                Password
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--c-text-muted)" }}>
                Change your sign-in password. Use at least 8 characters.
              </p>
            </div>
          </div>

          <Field label="Current password">
            <input
              className={inputClass}
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New password">
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </Field>
            <Field label="Confirm new password">
              <input
                className={inputClass}
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </Field>
          </div>

          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          {pwMessage && <p className="text-sm text-teal-500">{pwMessage}</p>}

          <button
            type="submit"
            disabled={changingPw}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ border: "1px solid var(--c-border)", color: "var(--c-heading)", background: "var(--c-hover-bg)" }}
          >
            {changingPw ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            Update password
          </button>
        </form>
      )}

      <div className="glass-card rounded-2xl p-6" style={{ border: "1px solid rgba(239,68,68,0.35)" }}>
        <h2 className="text-lg font-semibold text-red-400">Danger zone</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Permanently delete your account and all saved leads, search history, downloads, and exports.
        </p>
        <button
          type="button"
          onClick={deleteAccount}
          disabled={deleting}
          className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "#dc2626" }}
        >
          {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Delete account
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold" style={{ color: "var(--c-text-dim)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
