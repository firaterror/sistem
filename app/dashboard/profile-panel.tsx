"use client";

import { X, Loader2, Camera, Trash2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

/** Always fetch the authenticated user's ID from the session — never trust client state. */
async function getAuthUserId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function ProfilePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessage(null);

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setFirstName(user.user_metadata?.first_name || "");
        setLastName(user.user_metadata?.last_name || "");
        setEmail(user.email || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
    });
  }, [open]);

  async function handleSave() {
    setMessage(null);
    setLoading(true);

    // Always derive userId from the live session — prevents IDOR
    const userId = await getAuthUserId();
    if (!userId) {
      setMessage({ type: "error", text: "Session expired. Please log in again." });
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Update auth metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        avatar_url: avatarUrl,
      },
    });

    if (metaError) {
      setMessage({ type: "error", text: metaError.message });
      setLoading(false);
      return;
    }

    // Update email if changed
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user && email.trim() !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: email.trim(),
      });
      if (emailError) {
        setMessage({ type: "error", text: emailError.message });
        setLoading(false);
        return;
      }
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        setMessage({ type: "error", text: "Enter your current password to change it." });
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "New passwords do not match." });
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "New password must be at least 6 characters.",
        });
        setLoading(false);
        return;
      }

      // Verify current password by re-authenticating
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user?.email || email,
        password: currentPassword,
      });
      if (verifyError) {
        setMessage({ type: "error", text: "Current password is incorrect." });
        setLoading(false);
        return;
      }

      const { error: pwError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (pwError) {
        setMessage({ type: "error", text: pwError.message });
        setLoading(false);
        return;
      }
    }

    // Update profiles table — uses session userId, RLS enforces ownership
    await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage({ type: "success", text: "Profile updated successfully." });
    setLoading(false);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = await getAuthUserId();
    if (!userId) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Only JPEG, PNG, WebP, and GIF images are allowed.",
      });
      return;
    }

    if (file.size > MAX_SIZE) {
      setMessage({ type: "error", text: "Image must be under 2MB." });
      return;
    }

    const ext = EXT_MAP[file.type];

    setUploading(true);
    setMessage(null);
    const supabase = createClient();

    // Fixed path — userId from session, extension from MIME
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: "error", text: "Failed to upload avatar." });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);

    // Persist to auth metadata immediately
    await supabase.auth.updateUser({ data: { avatar_url: url } });

    setUploading(false);
    setMessage({ type: "success", text: "Avatar uploaded." });
  }

  async function handleAvatarRemove() {
    const userId = await getAuthUserId();
    if (!userId) return;

    setUploading(true);
    setMessage(null);
    const supabase = createClient();

    // Remove all avatar files for this user
    const { data: files } = await supabase.storage
      .from("avatars")
      .list(userId);

    if (files && files.length > 0) {
      await supabase.storage
        .from("avatars")
        .remove(files.map((f) => `${userId}/${f.name}`));
    }

    // Clear from auth metadata
    await supabase.auth.updateUser({ data: { avatar_url: null } });

    setAvatarUrl(null);
    setUploading(false);
    setMessage({ type: "success", text: "Avatar removed." });
  }

  const initials =
    (firstName?.[0] || "").toUpperCase() +
    (lastName?.[0] || "").toUpperCase();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border/60 bg-background shadow-2xl transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/60 px-6">
          <h2 className="text-lg font-semibold tracking-tight">Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
              disabled={uploading}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full object-cover border border-border/60"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-lg font-semibold border border-border/60">
                  {initials || "?"}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader2
                    size={18}
                    className="animate-spin text-muted-foreground"
                  />
                ) : (
                  <Camera size={18} className="text-muted-foreground" />
                )}
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Upload photo
              </button>
              {avatarUrl && (
                <>
                  <span className="text-xs text-border">·</span>
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={11} />
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-[var(--radius)] border px-3 py-2 text-sm
                ${
                  message.type === "success"
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : "border-destructive/50 bg-destructive/10 text-destructive"
                }
              `}
            >
              {message.text}
            </div>
          )}

          {/* Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="profile-first"
                className="block text-sm font-medium pb-1"
              >
                First name
              </label>
              <input
                id="profile-first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="profile-last"
                className="block text-sm font-medium pb-1"
              >
                Last name
              </label>
              <input
                id="profile-last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-email"
              className="block text-sm font-medium pb-1"
            >
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="border-t border-border/40 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
              Security
            </p>
            <div className="rounded-[var(--radius)] border border-border/60 bg-card/40 p-4 space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-pw-current"
                  className="block text-xs text-muted-foreground"
                >
                  Current password
                </label>
                <input
                  id="profile-pw-current"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  className={inputClass}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-pw"
                    className="block text-xs text-muted-foreground"
                  >
                    New password
                  </label>
                  <input
                    id="profile-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-pw-confirm"
                    className="block text-xs text-muted-foreground"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="profile-pw-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-[var(--radius)] border border-border/60 px-4 text-sm font-medium transition-colors hover:bg-accent cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius)] bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
