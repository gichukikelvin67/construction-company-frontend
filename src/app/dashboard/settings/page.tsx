"use client";

import { useState,useRef,useEffect, type ReactNode } from "react";
import{useTheme}from "next-themes";
import { changePassword, logoutUser,deactivateMyAccount } from "@/services/authService";
import { useRouter } from "next/navigation";
import {
  getRegionalPreferences,
  updateRegionalPreferences,
  type RegionalPreferences,
} from "@/services/regionalPreferencesService";
import {
  UserRound,
  Palette,
  ShieldCheck,
  Globe,
  UserX,
  Bell,
  Monitor,
  LoaderCircle,
  Trash2,
  Camera,
  Sun,
  Eye,
  EyeOff,
  Moon,
  Save,
  LockKeyhole,
  ChevronRight,
  Check,
  Sparkles,
  Laptop,
  Mail,
  Smartphone,
  Clock3,
  Coins,
  AlertTriangle,
  ArrowUpRight,
  SlidersHorizontal,
} from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyProfilePhoto,
  removeMyProfilePhoto,
  type UserProfile,
} from "@/services/profileService";

type Theme = "light" | "dark" | "system";
type SectionId =
  | "profile"
  | "appearance"
  | "security"
  | "regional"
  | "notifications"
  | "account";

const sections: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  { id: "profile", label: "Profile", description: "Your personal details", icon: UserRound },
  { id: "appearance", label: "Appearance", description: "Theme and display", icon: Palette },
  { id: "security", label: "Password & Security", description: "Keep your account safe", icon: ShieldCheck },
  { id: "regional", label: "Language & Region", description: "Locale and formats", icon: Globe },
  { id: "notifications", label: "Notifications", description: "How we reach you", icon: Bell },
  { id: "account", label: "Account Management", description: "Deactivate or delete", icon: UserX },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7 border-b border-[var(--border)] pb-5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--architect-green)]">
        {eyebrow}
      </p>
      <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 text-sm font-semibold text-[var(--foreground)]">
      {label}
      {children}
      {hint && (
        <span className="mt-2 block text-xs font-normal leading-5 text-[var(--muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

function PreferenceCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof LockKeyhole;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition duration-200 hover:border-[var(--architect-green)]/35 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--architect-green)] transition group-hover:border-[var(--architect-green)]/30">
          <Icon size={19} strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
        </div>
      </div>
      <div className="sm:shrink-0 sm:pl-4">{children}</div>
    </div>
  );
}

const inputClass =
  "mt-2.5 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm font-normal text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 hover:border-[var(--muted)]/50 focus:border-[var(--architect-green)] focus:ring-4 focus:ring-[var(--architect-green)]/10 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--architect-green)]/40 hover:bg-[var(--background)] focus:outline-none focus:ring-4 focus:ring-[var(--architect-green)]/10";

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--architect-green)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-[var(--architect-green)]/20";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const {theme,setTheme,resolvedTheme}=useTheme();
  const currentTheme=theme ?? "system";
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [currency, setCurrency] = useState("KES");
  const [regionalLoading, setRegionalLoading] = useState(true);
const [regionalSaving, setRegionalSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordError, setPasswordError] = useState("");
const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
const [profileName, setProfileName] = useState("");
const [profilePhone, setProfilePhone] = useState("");
const [profileLoading, setProfileLoading] = useState(true);
const [profileSaving, setProfileSaving] = useState(false);
const [photoUploading, setPhotoUploading] = useState(false);
const [photoRemoving, setPhotoRemoving] = useState(false);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [photoError, setPhotoError] = useState("");
const router = useRouter();

const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
const [deactivationLoading, setDeactivationLoading] = useState(false);
const [deactivationError, setDeactivationError] = useState("");
const fileInputRef = useRef<HTMLInputElement>(null);

  const active =
    sections.find((section) => section.id === activeSection) ?? sections[0];
  const ActiveIcon = active.icon;

  const showMessage = (text: string) => setMessage(text);
  const handleChangePassword = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  setPasswordError("");
  setPasswordSuccess("");
  setMessage("");

  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError("Please complete all password fields.");
    return;
  }

  if (newPassword.length < 8 || newPassword.length > 100) {
    setPasswordError("Your new password must be between 8 and 100 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError("The new passwords do not match.");
    return;
  }

  if (currentPassword === newPassword) {
    setPasswordError("Your new password must differ from your current password.");
    return;
  }

  try {
    setPasswordSaving(true);

    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    setPasswordSuccess(
      result.message || "Password changed successfully. Please sign in again."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error: unknown) {
    const responseMessage =
      typeof error === "object" &&
      error !== null &&
      "response" in error
        ? (
            error as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          ).response?.data?.message
        : undefined;

    setPasswordError(
      responseMessage || "Unable to change your password. Please try again."
    );
  } finally {
    setPasswordSaving(false);
  }
};
const handleSaveRegionalPreferences = async () => {
  setMessage("");

  try {
    setRegionalSaving(true);

    const preferences: RegionalPreferences = {
      language: language as RegionalPreferences["language"],
      timezone: timezone as RegionalPreferences["timezone"],
      currency: currency as RegionalPreferences["currency"],
    };

    const saved = await updateRegionalPreferences(preferences);

    setLanguage(saved.language);
    setTimezone(saved.timezone);
    setCurrency(saved.currency);

    setMessage("Regional preferences saved successfully.");
  } catch (error: unknown) {
    const responseMessage =
      typeof error === "object" &&
      error !== null &&
      "response" in error
        ? (
            error as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          ).response?.data?.message
        : undefined;

    setMessage(
      responseMessage || "Unable to save regional preferences. Please try again."
    );
  } finally {
    setRegionalSaving(false);
  }
};
const handleDeactivateAccount = async () => {
  if (deactivationLoading) return;

  setDeactivationLoading(true);
  setDeactivationError("");

  try {
    await deactivateMyAccount();

    setShowDeactivateDialog(false);
    router.replace("/login");
  } catch {
    setDeactivationError(
      "We couldn't deactivate your account. Please try again or contact your administrator."
    );
  } finally {
    setDeactivationLoading(false);
  }
};
  
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      showMessage("Full name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setMessage("");

      const updatedProfile = await updateMyProfile({
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });

      setProfile(updatedProfile);
      setProfileName(updatedProfile.name ?? "");
      setProfilePhone(updatedProfile.phone ?? "");
      showMessage("Profile updated successfully.");
    } catch {
      showMessage("Unable to update your profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setPhotoError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Your profile photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      setPhotoUploading(true);

      const photoUrl = await uploadMyProfilePhoto(file);

      setProfile((current) =>
        current ? { ...current, profilePhoto: photoUrl } : current
      );

      setPhotoPreview(null);
      showMessage("Profile photo updated successfully.");
    } catch {
      setPhotoPreview(null);
      setPhotoError("Photo upload failed. Please try again.");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPhotoUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setPhotoRemoving(true);
      setPhotoError("");
      setMessage("");

      await removeMyProfilePhoto();

      setProfile((current) =>
        current ? { ...current, profilePhoto: null } : current
      );

      setPhotoPreview(null);
      showMessage("Profile photo removed successfully.");
    } catch {
      setPhotoError("Unable to remove your profile photo. Please try again.");
    } finally {
      setPhotoRemoving(false);
    }
  };

  useEffect(() => {
  let cancelled = false;

  const loadProfile = async () => {
    try {
      setProfileLoading(true);
      const user = await getMyProfile();

      if (cancelled) return;

      setProfile(user);
      setProfileName(user.name ?? "");
      setProfilePhone(user.phone ?? "");
    } catch {
      if (!cancelled) {
        setPhotoError("Unable to load your profile. Please sign in again or retry.");
      }
    } finally {
      if (!cancelled) {
        setProfileLoading(false);
      }
    }
  };

  void loadProfile();

  return () => {
    cancelled = true;
  };
}, []);
useEffect(() => {
  let cancelled = false;

  const loadRegionalPreferences = async () => {
    try {
      setRegionalLoading(true);

      const preferences = await getRegionalPreferences();

      if (cancelled) return;

      setLanguage(preferences.language);
      setTimezone(preferences.timezone);
      setCurrency(preferences.currency);
    } catch {
      if (!cancelled) {
        setMessage(
          "Unable to load regional preferences. Please refresh and try again."
        );
      }
    } finally {
      if (!cancelled) {
        setRegionalLoading(false);
      }
    }
  };

  void loadRegionalPreferences();

  return () => {
    cancelled = true;
  };
}, []);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-7 pb-12">
      {/* Premium page header */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div
          className="absolute inset-y-0 right-0 -z-10 w-2/3 opacity-70"
          aria-hidden="true"
        >
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[var(--architect-green)]/15" />
          <div className="absolute right-12 -top-20 h-64 w-64 rounded-full border border-[var(--architect-green)]/10" />
          <div className="absolute bottom-[-9rem] right-1/4 h-72 w-72 rounded-full bg-[var(--architect-green)]/5 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--architect-green)]/20 bg-[var(--architect-green)]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--architect-green)]">
              <Sparkles size={13} />
              Workspace preferences
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-[2.7rem]">
              Settings
              <span className="text-[var(--architect-green)]">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
              Shape your Aesthetics workspace around the way you work. Manage
              your profile, personalize your experience and keep your account
              protected.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/80 p-4 backdrop-blur-sm lg:min-w-[245px]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--foreground)]">
                Workspace controls
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                6 preference categories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Status message */}
      {message && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-2xl border border-[var(--architect-green)]/25 bg-[var(--architect-green)]/5 p-4 text-sm text-[var(--foreground)]"
        >
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--architect-green)]/15 text-[var(--architect-green)]">
            <Check size={14} />
          </div>
          <p className="flex-1 leading-6">{message}</p>
          <button
            type="button"
            onClick={() => setMessage("")}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
        {/* Settings navigation */}
        <aside className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm lg:sticky lg:top-24">
          <div className="px-3 pb-4 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
              Manage workspace
            </p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
              Choose a category to customize.
            </p>
          </div>

          <nav className="space-y-1.5" aria-label="Settings sections">
            {sections.map(({ id, label, description, icon: Icon }) => {
              const selected = activeSection === id;

              return (
                <button
                  key={id}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  onClick={() => {
                    setActiveSection(id);
                    setMessage("");
                  }}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-all duration-200 ${
                    selected
                      ? "bg-[var(--architect-green)]/10 ring-1 ring-inset ring-[var(--architect-green)]/20"
                      : "hover:bg-[var(--background)]"
                  }`}
                >
                  {selected && (
                    <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[var(--architect-green)]" />
                  )}

                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                      selected
                        ? "bg-[var(--architect-green)] text-white shadow-sm"
                        : "bg-[var(--background)] text-[var(--muted)] group-hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold ${
                        selected
                          ? "text-[var(--architect-green)]"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {label}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[var(--muted)]">
                      {description}
                    </span>
                  </span>

                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition ${
                      selected
                        ? "translate-x-0.5 text-[var(--architect-green)]"
                        : "text-[var(--muted)]/60"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-2 text-[var(--architect-green)]">
              <ShieldCheck size={17} />
              <p className="text-xs font-bold">Your account matters</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Keep your account details up to date and protect your sign-in
              credentials.
            </p>
          </div>
        </aside>

        {/* Active settings panel */}
        <div className="min-w-0 space-y-6">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
              <ActiveIcon size={21} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Settings category
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                {active.label}
              </p>
            </div>
            <div className="ml-auto hidden rounded-full border border-[var(--border)] px-3 py-1.5 text-[10px] font-semibold text-[var(--muted)] sm:block">
              AESTHETICS WORKSPACE
            </div>
          </div>

          {/* Profile */}
          
          {/* Profile */}
          {activeSection === "profile" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Personal identity"
                title="Your profile"
                description="Manage the personal details associated with your Aesthetics account."
              />

              <div className="mb-7 flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
                  {photoPreview || profile?.profilePhoto ? (
                    <img
                      src={photoPreview ?? profile?.profilePhoto ?? ""}
                      alt="Profile photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={34} strokeWidth={1.6} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-[var(--foreground)]">
                    {profileLoading ? "Loading profile..." : profile?.name || "Your profile"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                    Upload a JPEG, PNG, or WebP image up to 5 MB.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={profileLoading || photoUploading || photoRemoving}
                      className={secondaryButtonClass}
                    >
                      {photoUploading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Camera size={16} />
                      )}
                      {profile?.profilePhoto ? "Replace photo" : "Upload photo"}
                    </button>

                    {profile?.profilePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={photoUploading || photoRemoving}
                        className={secondaryButtonClass}
                      >
                        {photoRemoving ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {photoError && (
                <p role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
                  {photoError}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    type="text"
                    autoComplete="name"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    placeholder="Your full name"
                    disabled={profileLoading || profileSaving}
                    className={inputClass}
                  />
                </Field>

                <Field label="Email address" hint="Contact your administrator if your email needs to change.">
                  <input
                    type="email"
                    autoComplete="email"
                    value={profile?.email ?? ""}
                    readOnly
                    className={`${inputClass} cursor-not-allowed opacity-70`}
                  />
                </Field>

                <Field label="Phone number">
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={profilePhone}
                    onChange={(event) => setProfilePhone(event.target.value)}
                    placeholder="+254 7XX XXX XXX"
                    disabled={profileLoading || profileSaving}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Company"
                  hint="Company membership is managed by an authorized administrator."
                >
                  <input
                    type="text"
                    disabled
                    value={profile?.company ? "Company account" : ""}
                    placeholder="Managed by your organization"
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                />
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Your personal details are saved to your account. Your email and company membership cannot be changed here.
                </p>
              </div>

              {message && (
                <p role="status" className="mt-4 text-sm text-[var(--architect-green)]">
                  {message}
                </p>
              )}

              <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-5">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={profileLoading || profileSaving || !profile}
                  className={primaryButtonClass}
                >
                  {profileSaving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {profileSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </section>
          )}


          {/* Appearance */}
          {activeSection === "appearance" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Personalize your workspace"
                title="Appearance"
                description="Choose the display style that feels right for your working environment."
              />

              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={currentTheme=== id}
                    onClick={() => {
                      setTheme(id);
                      showMessage(
                        `${label} mode applied successfully.`
                      );
                    }}
                    className={`group rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:p-5 ${
                      theme === id
                        ? "border-[var(--architect-green)] bg-[var(--architect-green)]/5 ring-2 ring-[var(--architect-green)]/10"
                        : "border-[var(--border)] hover:border-[var(--architect-green)]/40"
                    }`}
                  >
                    <div
                      className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${
                        theme === id
                          ? "bg-[var(--architect-green)] text-white"
                          : "bg-[var(--background)] text-[var(--muted)]"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[var(--foreground)]">
                        {label}
                      </p>
                      {theme === id && (
                        <Check
                          size={17}
                          className="text-[var(--architect-green)]"
                        />
                      )}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      {id === "system"
                        ? "Follow your device settings."
                        : `Use ${label.toLowerCase()} mode throughout the workspace.`}
                    </p>

                    <div
                      className={`mt-5 flex h-16 gap-1.5 overflow-hidden rounded-lg border p-2 ${
                        id === "dark"
                          ? "border-slate-700 bg-slate-950"
                          : id === "light"
                            ? "border-slate-200 bg-white"
                            : "border-[var(--border)] bg-[var(--background)]"
                      }`}
                    >
                      <div
                        className={`w-1/4 rounded ${
                          id === "dark"
                            ? "bg-slate-800"
                            : "bg-slate-200"
                        }`}
                      />
                      <div className="flex flex-1 flex-col gap-1.5">
                        <div
                          className={`h-2 w-3/4 rounded ${
                            id === "dark" ? "bg-slate-700" : "bg-slate-200"
                          }`}
                        />
                        <div
                          className={`h-2 w-full rounded ${
                            id === "dark" ? "bg-slate-800" : "bg-slate-100"
                          }`}
                        />
                        <div className="h-2 w-1/2 rounded bg-[var(--architect-green)]/70" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <Monitor
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                />
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Your display preference applies accross the workspace.System mode 
                  follows your device's appearance settings.
                  {resolvedTheme&&(
                    <>Currently displaying{resolvedTheme} mode.</>
                  )}
                </p>
              </div>
            </section>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Protect your workspace"
                title="Password & security"
                description="Review the ways you protect your account and manage signed-in devices."
              />

              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
                    <LockKeyhole size={19} />
                  </div>
                  <p className="mt-4 text-sm font-bold text-[var(--foreground)]">
                    Password protection
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Use a strong, unique password and never share it with other
                    users.
                  </p>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--architect-green)]/10 text-[var(--architect-green)]">
                    <ShieldCheck size={19} />
                  </div>
                  <p className="mt-4 text-sm font-bold text-[var(--foreground)]">
                    Session awareness
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    Sign out of devices you no longer use, especially shared
                    computers.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
               <form
  onSubmit={handleChangePassword}
  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6"
>
  <div className="mb-6">
    <h3 className="text-base font-bold text-[var(--foreground)]">
      Change your password
    </h3>
    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
      Enter your current password, then choose a new password that you
      haven't used before.
    </p>
  </div>

  <div className="space-y-5">
    <Field label="Current password">
      <div className="relative">
        <input
          type={showCurrentPassword ? "text" : "password"}
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={`${inputClass} pr-12`}
          placeholder="Enter current password"
          disabled={passwordSaving}
          required
        />
        <button
          type="button"
          onClick={() => setShowCurrentPassword((value) => !value)}
          aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>

    <Field
      label="New password"
      hint="Use 8–100 characters. A unique password is recommended."
    >
      <div className="relative">
        <input
          type={showNewPassword ? "text" : "password"}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          className={`${inputClass} pr-12`}
          placeholder="Enter new password"
          disabled={passwordSaving}
          minLength={8}
          maxLength={100}
          required
        />
        <button
          type="button"
          onClick={() => setShowNewPassword((value) => !value)}
          aria-label={showNewPassword ? "Hide new password" : "Show new password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>

    <Field label="Confirm new password">
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={`${inputClass} pr-12`}
          placeholder="Re-enter new password"
          disabled={passwordSaving}
          minLength={8}
          maxLength={100}
          required
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((value) => !value)}
          aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  </div>

  {passwordError && (
    <p
      role="alert"
      className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600"
    >
      {passwordError}
    </p>
  )}

  {passwordSuccess && (
    <p
      role="status"
      className="mt-5 rounded-xl border border-[var(--architect-green)]/25 bg-[var(--architect-green)]/5 p-3 text-sm text-[var(--foreground)]"
    >
      {passwordSuccess}
    </p>
  )}

  <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-5">
    <button
      type="submit"
      disabled={passwordSaving}
      className={primaryButtonClass}
    >
      {passwordSaving ? (
        <LoaderCircle size={16} className="animate-spin" />
      ) : (
        <LockKeyhole size={16} />
      )}
      {passwordSaving ? "Updating password..." : "Update password"}
    </button>
  </div>
</form>

                <PreferenceCard
                  icon={Laptop}
                  title="Active sessions"
                  description="Review and revoke other devices signed in to your account."
                >
                  <button
                    type="button"
                    onClick={() =>
                      showMessage(
                        "Session management is not connected yet. No sessions have been changed."
                      )
                    }
                    className={secondaryButtonClass}
                  >
                    Manage sessions
                    <ChevronRight size={15} />
                  </button>
                </PreferenceCard>
              </div>
            </section>
          )}

          {/* Language and region */}
          {activeSection === "regional" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Localize your workspace"
                title="Language & region"
                description="Set the formats used to display dates, times and currency throughout the interface."
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Display language">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className={inputClass}
                  >
                    <option value="en">English</option>
                    <option value="sw">Kiswahili (coming soon)</option>
                  </select>
                </Field>

                <Field label="Time zone">
                  <select
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    className={inputClass}
                  >
                    <option value="Africa/Nairobi">
                      East Africa Time — Nairobi
                    </option>
                    <option value="UTC">
                      Coordinated Universal Time (UTC)
                    </option>
                  </select>
                </Field>

                <Field label="Display currency">
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className={inputClass}
                  >
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="USD">USD — US Dollar</option>
                  </select>
                </Field>
              </div>

              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex items-start gap-3">
                  <Coins
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--architect-green)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Financial data stays intact
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      This is a display preference only. Changing currency
                      here must not convert or rewrite existing invoice or
                      payment records.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[var(--muted)]">
                  These preferences are temporary until persistence is
                  connected.
                </p>
               <button
  type="button"
  onClick={handleSaveRegionalPreferences}
  disabled={regionalLoading || regionalSaving}
  className={primaryButtonClass}
>
  {regionalSaving ? (
    <LoaderCircle size={16} className="animate-spin" />
  ) : (
    <Save size={16} />
  )}
  {regionalLoading
    ? "Loading preferences..."
    : regionalSaving
      ? "Saving preferences..."
      : "Save preferences"}
</button>
              </div>
            </section>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Stay informed"
                title="Notifications"
                description="Choose where you want to receive important updates from your workspace."
              />

              <div className="space-y-3">
                <PreferenceCard
                  icon={Mail}
                  title="Email notifications"
                  description="Receive important project, account and activity updates by email."
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.email}
                    aria-label="Email notifications"
                    onClick={() =>
                      setNotifications((current) => ({
                        ...current,
                        email: !current.email,
                      }))
                    }
                    className={`relative h-7 w-12 rounded-full transition ${
                      notifications.email
                        ? "bg-[var(--architect-green)]"
                        : "bg-[var(--muted)]/35"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        notifications.email ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </PreferenceCard>

                <PreferenceCard
                  icon={Smartphone}
                  title="In-app notifications"
                  description="Show updates and reminders inside your Aesthetics dashboard."
                >
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifications.inApp}
                    aria-label="In-app notifications"
                    onClick={() =>
                      setNotifications((current) => ({
                        ...current,
                        inApp: !current.inApp,
                      }))
                    }
                    className={`relative h-7 w-12 rounded-full transition ${
                      notifications.inApp
                        ? "bg-[var(--architect-green)]"
                        : "bg-[var(--muted)]/35"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        notifications.inApp ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </PreferenceCard>
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Your selections are local to this page until notification
                  preferences are saved to the API.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    showMessage(
                      `Notification preferences selected: email ${
                        notifications.email ? "on" : "off"
                      }, in-app ${
                        notifications.inApp ? "on" : "off"
                      }. These choices are not saved to the server yet.`
                    )
                  }
                  className={primaryButtonClass}
                >
                  <Save size={16} />
                  Save preferences
                </button>
              </div>
            </section>
          )}

          {/* Account management */}
          {activeSection === "account" && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-8">
                <SectionHeading
                  eyebrow="Temporary access control"
                  title="Deactivate account"
                  description="Deactivation should temporarily prevent sign-in while preserving business records according to your organization's policies."
                />

                
<PreferenceCard
  icon={Clock3}
  title="Deactivate my account"
  description="Temporarily disable your access while preserving your construction projects, invoices, payments, and other business records."
>
  <button
    type="button"
    onClick={() => {
      setDeactivationError("");
      setShowDeactivateDialog(true);
    }}
    disabled={deactivationLoading}
    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/5 disabled:cursor-not-allowed disabled:opacity-60"
  >
    Deactivate account
    <UserX size={16} />
  </button>
</PreferenceCard>

              </div>

              <div className="overflow-hidden rounded-2xl border border-red-500/25 bg-[var(--surface)] shadow-sm">
                <div className="h-1 bg-red-500" />
                <div className="p-5 sm:p-8">
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
                      <AlertTriangle size={21} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-600">
                        Danger zone
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
                        Delete account
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                        Permanent deletion may be irreversible. Construction
                        invoices, payments and audit records may need to be
                        retained even if a user's access is removed.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Deletion is currently disabled
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                      Before enabling this action, implement
                      re-authentication, explicit confirmation, administrator
                      authorization where applicable, and a clear
                      record-retention policy.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      showMessage(
                        "Account deletion is intentionally disabled. No data or account has been deleted."
                      )
                    }
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/35 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-500/5"
                  >
                    <UserX size={16} />
                    View deletion safeguards
                  </button>

                </div>
              </div>
            </section>
          )}
          
{showDeactivateDialog && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    onClick={(event) => {
      if (event.target === event.currentTarget && !deactivationLoading) {
        setShowDeactivateDialog(false);
        setDeactivationError("");
      }
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="deactivate-dialog-title"
      className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-600">
        <UserX size={22} />
      </div>

      <h2
        id="deactivate-dialog-title"
        className="text-xl font-bold text-[var(--foreground)]"
      >
        Deactivate your account?
      </h2>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        You will lose access to this account, and your active sessions
        will be revoked. Your business records will remain in the system.
        Contact your administrator to arrange reactivation.
      </p>

      {deactivationError && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-500/25 bg-red-500/5 p-3 text-sm text-red-600"
        >
          {deactivationError}
        </p>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={deactivationLoading}
          onClick={() => {
            setShowDeactivateDialog(false);
            setDeactivationError("");
          }}
          className={secondaryButtonClass}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={deactivationLoading}
          onClick={handleDeactivateAccount}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deactivationLoading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Deactivating...
            </>
          ) : (
            "Confirm deactivation"
          )}
        </button>
      </div>
    </section>
  </div>
)}

        </div>
      </div>
    </div>
  );
}