import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  Mail,
  Building2,
  Users,
  Briefcase,
  UserCheck,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { AppShell } from "../../layouts/AppShell";
import { useDepartments, useTeams } from "../../hooks/useOrganization";
import { useManagers, useMentors, useTemplates } from "../../hooks/useHRData";
import { useInviteDeveloper } from "../../hooks/useInviteDeveloper";
import type { InviteFormData } from "../../types/invite";

const STEPS = ["Basics", "Assignment", "Review"];

export default function InviteDeveloperPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState<InviteFormData>({
    full_name: "",
    email: "",
    department: "",
    team: "",
    job_role: "",
    manager: "",
    mentor: "",
    start_date: "",
    onboarding_template: "",
  });

  const { data: departments } = useDepartments();
  const { data: teams } = useTeams();
  const { data: managers } = useManagers();
  const { data: mentors } = useMentors();
  const { data: templates } = useTemplates();

  const inviteDeveloper = useInviteDeveloper();

  const teamsForDepartment =
    teams?.filter((t) => t.department === form.department) ?? [];

  const update = (field: keyof InviteFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Map option data for custom selects
  const departmentOptions =
    departments?.map((d) => ({ value: d.id, label: d.name })) ?? [];

  const teamOptions =
    teamsForDepartment.map((t) => ({ value: t.id, label: t.name })) ?? [];

  const managerOptions =
    managers?.map((m) => ({
      value: m.id,
      label: m.full_name,
      description: m.job_role,
    })) ?? [];

  const mentorOptions =
    mentors?.map((m) => ({
      value: m.id,
      label: m.full_name,
      description: m.job_role,
    })) ?? [];

  const canProceedStep0 =
    form.full_name && form.email && form.department && form.team;
  const canProceedStep1 =
    form.job_role &&
    form.manager &&
    form.mentor &&
    form.start_date &&
    form.onboarding_template;

  const handleSubmit = async () => {
    const result = await inviteDeveloper.mutateAsync(form);
    setSuccessMessage(result.message);
    setTimeout(() => navigate("/hr/developers"), 1500);
  };

  const selectedDepartmentName =
    departments?.find((d) => d.id === form.department)?.name ?? "";
  const selectedTeamName =
    teamsForDepartment.find((t) => t.id === form.team)?.name ?? "";
  const selectedManagerName =
    managers?.find((m) => m.id === form.manager)?.full_name ?? "";
  const selectedMentorName =
    mentors?.find((m) => m.id === form.mentor)?.full_name ?? "";
  const selectedTemplate = templates?.find(
    (t) => t.id === form.onboarding_template
  );

  return (
    <AppShell title="Invite Developer">
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-8xl mx-auto w-full min-h-[calc(100vh-4rem)] space-y-6">
        {/* Header */}
        <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink flex items-center gap-2.5">
              Invite New Developer
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted">
              Configure profile, assignments, and onboarding workflows for a new engineer.
            </p>
          </div>
        </div>

        {/* Stepper Card */}
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            {STEPS.map((label, i) => {
              const isDone = i < step;
              const isCurrent = i === step;

              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isDone
                          ? "bg-primary text-white"
                          : isCurrent
                          ? "bg-primary/10 text-primary border-2 border-primary"
                          : "bg-canvas text-ink-muted/70 border border-border"
                      }`}
                    >
                      {isDone ? <Check size={16} /> : i + 1}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-medium hidden sm:inline-block ${
                        isCurrent
                          ? "text-ink font-semibold"
                          : isDone
                          ? "text-ink"
                          : "text-ink-muted"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-3 sm:mx-4 transition-colors ${
                        i < step ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {successMessage ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 sm:p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="font-display font-bold text-ink text-xl">
              Invitation Sent!
            </h2>
            <p className="text-sm text-emerald-700 font-medium max-w-md">
              {successMessage}
            </p>
            <p className="text-xs text-ink-muted">
              Redirecting to developers roster...
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
            {/* Step 0: Basics */}
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="font-display text-base font-semibold text-ink">
                    Basic Information
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Enter the candidate's personal details and team placement.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Full Name"
                    required
                    icon={<User size={15} />}
                    type="text"
                    value={form.full_name}
                    onChange={(val) => update("full_name", val)}
                    placeholder="e.g. Sarah Connor"
                  />

                  <InputField
                    label="Company Email"
                    required
                    icon={<Mail size={15} />}
                    type="email"
                    value={form.email}
                    onChange={(val) => update("email", val)}
                    placeholder="s.connor@company.com"
                  />

                  <Select
                    label="Department"
                    required
                    icon={<Building2 size={15} />}
                    placeholder="Select department"
                    options={departmentOptions}
                    value={form.department}
                    onChange={(val) => {
                      update("department", val);
                      update("team", "");
                    }}
                  />

                  <Select
                    label="Team"
                    required
                    icon={<Users size={15} />}
                    placeholder={
                      !form.department
                        ? "Select a department first"
                        : "Select team"
                    }
                    disabled={!form.department}
                    options={teamOptions}
                    value={form.team}
                    onChange={(val) => update("team", val)}
                  />
                </div>
              </div>
            )}

            {/* Step 1: Assignment */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="font-display text-base font-semibold text-ink">
                    Role & Onboarding Assignment
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Assign leadership support and select the onboarding workflow.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Job Role"
                    required
                    icon={<Briefcase size={15} />}
                    type="text"
                    value={form.job_role}
                    onChange={(val) => update("job_role", val)}
                    placeholder="e.g. Senior Backend Engineer"
                  />

                  <InputField
                    label="Start Date"
                    required
                    icon={<Calendar size={15} />}
                    type="date"
                    value={form.start_date}
                    onChange={(val) => update("start_date", val)}
                  />

                  <Select
                    label="Manager"
                    required
                    icon={<UserCheck size={15} />}
                    placeholder="Select manager"
                    options={managerOptions}
                    value={form.manager}
                    onChange={(val) => update("manager", val)}
                  />

                  <Select
                    label="Mentor"
                    required
                    icon={<UserCheck size={15} />}
                    placeholder="Select mentor"
                    options={mentorOptions}
                    value={form.mentor}
                    onChange={(val) => update("mentor", val)}
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2.5">
                    Onboarding Template <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates?.map((t) => {
                      const isSelected = form.onboarding_template === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => update("onboarding_template", t.id)}
                          className={`text-left border rounded-xl p-3.5 transition-all flex flex-col justify-between gap-2 shadow-xs cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/40 bg-surface"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-ink">
                              {t.name}
                            </p>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? "border-primary bg-primary text-white"
                                  : "border-border bg-canvas"
                              }`}
                            >
                              {isSelected && <Check size={10} />}
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted bg-canvas border border-border px-2 py-0.5 rounded-md w-fit">
                            <FileText size={12} />
                            {t.target_role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-border/80 pb-3">
                  <h2 className="font-display text-base font-semibold text-ink">
                    Review Invitation Details
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Double check all information before sending out the onboarding invitation.
                  </p>
                </div>

                <div className="bg-canvas border border-border/80 rounded-xl divide-y divide-border/60 overflow-hidden">
                  <ReviewRow label="Full Name" value={form.full_name} />
                  <ReviewRow label="Email Address" value={form.email} />
                  <ReviewRow label="Department" value={selectedDepartmentName} />
                  <ReviewRow label="Team" value={selectedTeamName} />
                  <ReviewRow label="Job Role" value={form.job_role} />
                  <ReviewRow label="Manager" value={selectedManagerName} />
                  <ReviewRow label="Mentor" value={selectedMentorName} />
                  <ReviewRow label="Start Date" value={form.start_date} />
                  <ReviewRow
                    label="Onboarding Template"
                    value={selectedTemplate?.name ?? ""}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border/80">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-muted hover:text-ink disabled:opacity-40 disabled:hover:text-ink-muted px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 0 ? !canProceedStep0 : !canProceedStep1}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  Continue
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={inviteDeveloper.isPending}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-xs cursor-pointer"
                >
                  {inviteDeveloper.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Invitation
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error Message Display */}
            {inviteDeveloper.isError && (
              <div className="bg-danger/10 border border-danger/30 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-danger font-medium animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <p>
                  {(inviteDeveloper.error as any)?.response?.data?.email?.[0] ??
                    "Something went wrong while sending the invitation."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

{/* --- Custom Styled Select Dropdown --- */}
interface Option {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  label?: string;
  required?: boolean;
}

function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  icon,
  label,
  required,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
          {icon && <span className="text-ink-muted/80">{icon}</span>}
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full bg-surface border rounded-xl px-3.5 py-2.5 text-sm text-left flex items-center justify-between gap-2 transition-all shadow-xs outline-hidden cursor-pointer ${
            disabled
              ? "opacity-50 cursor-not-allowed bg-canvas border-border"
              : isOpen
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50"
          }`}
        >
          <span
            className={`truncate ${
              selectedOption ? "text-ink font-medium" : "text-ink-muted/60"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-ink-muted transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-primary" : ""
            }`}
          />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-surface border border-border rounded-xl shadow-lg max-h-56 overflow-y-auto py-1 animate-in fade-in zoom-in-95 duration-150 divide-y divide-border/40">
            {options.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-ink-muted text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-ink hover:bg-canvas"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{opt.label}</p>
                      {opt.description && (
                        <p className="text-[11px] text-ink-muted/80 font-normal truncate mt-0.5">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

{/* --- Reusable Input Field --- */}
function InputField({
  label,
  required,
  icon,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
        {icon && <span className="text-ink-muted/80">{icon}</span>}
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink-muted/60 shadow-xs"
      />
    </div>
  );
}

{/* --- Review Row Component --- */}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-xs sm:text-sm">
      <span className="text-ink-muted font-medium">{label}</span>
      <span className="text-ink font-semibold text-right">{value || "—"}</span>
    </div>
  );
}