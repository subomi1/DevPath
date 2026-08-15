import { useState, type FormEvent } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Save,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import client from "../../api/client";

export default function HRProfilePage() {
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const updateProfile = useMutation({
    mutationFn: async (data: { phone: string }) => {
      const response = await client.patch("/users/me/", data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser({ phone: data.phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    },
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    updateProfile.mutate({ phone });
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setIsChangingPassword(true);

    try {
      await client.post("/users/me/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError(
        "Could not update password. Please check your current password and try again.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell title="Profile">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Profile Hero Header */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold shrink-0 shadow-xs">
            {user.full_name?.charAt(0) ?? "M"}
          </div>
          <div className="space-y-1.5 min-w-0 flex-1">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-ink truncate">
                {user.full_name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={14} className="text-ink-muted/70" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Personal Info Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border pb-4 flex items-center gap-2">
              <User className="text-primary" size={20} />
              <h2 className="font-display font-semibold text-ink text-base">
                Personal Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Full Name"
                value={user.full_name}
                icon={User}
              />
              <ReadOnlyField
                label="Email Address"
                value={user.email}
                icon={Mail}
              />
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5 max-w-md">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                    size={16}
                  />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-canvas border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 transition-all shadow-xs disabled:opacity-60"
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>

                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                    <CheckCircle2 size={14} />
                    Profile updated
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Security & Password Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border pb-4 flex items-center gap-2">
              <KeyRound className="text-primary" size={20} />
              <h2 className="font-display font-semibold text-ink text-base">
                Security & Password
              </h2>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="space-y-4 max-w-md"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                    size={16}
                  />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-canvas border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted"
                    size={16}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full bg-canvas border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/50"
                  />
                </div>
              </div>

              {passwordError && (
                <div className="flex items-start gap-2 bg-danger/10 border border-danger/20 text-danger rounded-xl p-3 text-xs font-medium animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Password updated successfully.</span>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={
                    isChangingPassword || !currentPassword || !newPassword
                  }
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ReadOnlyField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="bg-canvas border border-border/80 rounded-xl p-3.5 space-y-1">
      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-ink-muted/70" />}
        {label}
      </p>
      <p className="text-xs sm:text-sm font-semibold text-ink truncate">
        {value || "—"}
      </p>
    </div>
  );
}
