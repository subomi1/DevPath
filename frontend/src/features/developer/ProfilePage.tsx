import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "../../layouts/AppShell";
import { useAuth } from "../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import client from "../../api/client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();

  const [phone, setPhone] = useState<string | undefined>(
    user?.phone || undefined,
  );

  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setPhone(user?.phone || undefined);
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data: { phone: string }) => {
      const response = await client.patch("/users/me/", data);
      return response.data;
    },

    onSuccess: (data) => {
      updateUser({ phone: data.phone });

      setPhone(data.phone);
      setPhoneError("");

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    },

    onError: (error: any) => {
      const backendError = error.response?.data;

      if (backendError?.phone?.length) {
        setPhoneError(backendError.phone[0]);
      } else if (backendError?.detail) {
        setPhoneError(backendError.detail);
      } else {
        setPhoneError("Something went wrong. Please try again.");
      }
    },
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();

    setSaved(false);
    setPhoneError("");

    if (!phone) {
      setPhoneError("Please enter a phone number.");
      return;
    }

    updateProfile.mutate({ phone });
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess(false);
    setIsChangingPassword(true);

    try {
      const response = await client.post("/users/me/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess(true);

      setCurrentPassword("");
      setNewPassword("");

      // Give the user a moment to see the success message
      setTimeout(() => {
        alert("Password changed successfully. Please log in again.");
        logout();
      }, 1500);
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setPasswordError(error.response.data.detail);
      } else {
        setPasswordError("Could not update password. Please try again.");
      }
    }
  };

  if (!user) return null;

  const hasPhoneChanged = phone !== (user.phone || undefined);

  // Helper for avatar initials
  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <AppShell title="Profile">
      <div className="p-6 lg:p-8 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Header Hero Banner */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-display font-bold text-2xl flex items-center justify-center shrink-0 shadow-inner">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-ink truncate">
              {user.full_name}
            </h1>
            <p className="text-sm text-ink-muted mt-0.5 truncate">
              {user.email}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {user.job_role || "Employee"}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm transition-all">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-ink">
                Personal Details
              </h2>
              <p className="text-xs text-ink-muted">
                Managed account information and contact preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <ReadOnlyField
              label="Full Name"
              value={user.full_name}
              icon={<UserIcon />}
            />
            <ReadOnlyField
              label="Email Address"
              value={user.email}
              icon={<MailIcon />}
            />
            <ReadOnlyField
              label="Job Role"
              value={user.job_role || "—"}
              icon={<BriefcaseIcon />}
            />
            <ReadOnlyField
              label="Start Date"
              value={user.start_date ?? "—"}
              icon={<CalendarIcon />}
            />
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-border/60 text-xs text-ink-muted mb-6 flex items-center gap-2">
            <InfoIcon className="w-4 h-4 text-ink-muted shrink-0" />
            <span>
              To update your official personal details above, please reach out
              to HR.
            </span>
          </div>

          <form
            onSubmit={handleProfileSubmit}
            className="flex flex-col gap-4 max-w-md pt-2"
          >
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Phone Number
              </label>

              <div className="phone-input-wrapper">
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    setPhoneError("");
                    setSaved(false);
                  }}
                  className="phone-input transition-all focus-within:ring-2 focus-within:ring-primary/20"
                />
              </div>

              {phoneError && (
                <div className="mt-2.5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium flex items-center gap-2">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{phoneError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={!hasPhoneChanged || updateProfile.isPending}
                className="bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] flex items-center gap-2"
              >
                {updateProfile.isPending && (
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                )}
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </button>

              {saved && (
                <div className="p-2.5 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <CheckCircleIcon className="w-4 h-4 shrink-0" />
                  <span>Phone number updated.</span>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Security / Password Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-border">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <LockIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg text-ink">
                Password & Security
              </h2>
              <p className="text-xs text-ink-muted">
                Ensure your account is using a strong, unique password
              </p>
            </div>
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 max-w-sm"
          >
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Current password
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full border border-border bg-surface rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                New password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full border border-border bg-surface rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium flex items-center gap-2">
                <AlertCircleIcon className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-medium flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 shrink-0" />
                <span>Password updated successfully.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-xl py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98] w-fit flex items-center gap-2 mt-1"
            >
              {isChangingPassword && (
                <SpinnerIcon className="w-4 h-4 animate-spin" />
              )}
              {isChangingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-neutral-50/60 dark:bg-neutral-900/20 border border-border/80 flex items-start gap-3">
      {icon && (
        <div className="text-ink-muted/70 mt-0.5 [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {label}
        </p>
        <p className="text-sm font-medium text-ink mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

/* Helper Icons */
function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" {...props}>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
