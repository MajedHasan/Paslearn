// app/admin/settings/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Settings as SettingsIcon, Save, RotateCcw, Loader2, RefreshCw,
  AlertCircle, CheckCircle2, Globe, DollarSign, Gift, Zap, Mail,
  FileText, ShieldCheck, CalendarClock, Puzzle, Bot, HardDrive,
  Link2, X, ChevronDown, ChevronUp, Activity,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

type TabKey =
  | "general" | "commerce" | "subscriptions" | "addons" | "ai"
  | "storage" | "email" | "security" | "features" | "affiliate"
  | "legal" | "health";

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: "general",       label: "General",       icon: Globe },
  { key: "commerce",      label: "Commerce",      icon: DollarSign },
  { key: "subscriptions", label: "Subscriptions", icon: CalendarClock },
  { key: "addons",        label: "Addons",        icon: Puzzle },
  { key: "ai",            label: "AI Studio",     icon: Bot },
  { key: "storage",       label: "Storage",       icon: HardDrive },
  { key: "email",         label: "Email",         icon: Mail },
  { key: "security",      label: "Security",      icon: ShieldCheck },
  { key: "features",      label: "Features",      icon: Zap },
  { key: "affiliate",     label: "Affiliate",     icon: Gift },
  { key: "legal",         label: "Legal",         icon: FileText },
  { key: "health",        label: "Health",        icon: Activity },
];

// ═══════════════════════════════════════════════════════════════
// Reusable pieces
// ═══════════════════════════════════════════════════════════════

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-slate-300">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F]" : "bg-slate-200"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )} />
      </button>
    </label>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
        <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
      </div>
      <div className="space-y-4 p-6">{children}</div>
    </div>
  );
}

function NumberInput({
  value, onChange, min, max, step = 1, suffix,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("rounded-lg tabular-nums", suffix && "pr-10")}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Skeleton
// ═══════════════════════════════════════════════════════════════

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-2">
      <style jsx>{`
        @keyframes adminShimmer { 0%{background-position:-1000px 0} 100%{background-position:1000px 0} }
        .admin-shimmer { background: linear-gradient(90deg,#FEE9DE 0%,#FFF5EE 50%,#FEE9DE 100%); background-size: 1000px 100%; animation: adminShimmer 2s infinite linear; }
      `}</style>
      <div className="flex items-center gap-2 rounded-xl border border-[#FFE1C7] bg-[#FEF3EE] px-4 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#EB5017] opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EB5017]" />
        </span>
        <p className="text-xs font-bold text-[#EB5017]">Loading settings…</p>
      </div>
      <div className="admin-shimmer h-28 rounded-2xl" />
      <div className="admin-shimmer h-12 rounded-2xl" />
      <div className="admin-shimmer h-96 rounded-2xl" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");
  const [settings, setSettings] = useState<any>(null);
  const [original, setOriginal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/admin/settings");
      setSettings(r.data.data);
      setOriginal(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const r = await api.get("/admin/settings/health");
      setHealth(r.data.data);
    } catch (e) {
      console.warn("health check failed:", e);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (tab === "health" && !health) loadHealth();
  }, [tab, health, loadHealth]);

  const dirty = settings && original && JSON.stringify(settings) !== JSON.stringify(original);

  const update = (section: string, patch: any) => {
    setSettings((prev: any) => prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev);
  };

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const r = await api.put("/admin/settings", settings);
      setSettings(r.data.data);
      setOriginal(r.data.data);
      setLastSaved(new Date());
      toast.success("Settings saved", { description: "Changes are live immediately." });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to save settings";
      toast.error("Couldn't save settings", { description: msg });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (original) {
      setSettings(original);
      toast.info("Changes reverted");
    }
  };

  if (loading) return <SettingsSkeleton />;

  if (error || !settings) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FEF3F2] to-[#FEE4E2] shadow-lg">
          <AlertCircle className="h-8 w-8 text-[#9E0A05]" />
        </div>
        <h2 className="mt-5 text-xl font-black tracking-tight text-slate-900">Couldn&apos;t load settings</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error || "Something went wrong"}</p>
        <Button
          className="mt-6 h-11 rounded-xl bg-[#EB5017] font-bold text-white shadow-md shadow-[#EB5017]/25 hover:bg-[#D94512]"
          onClick={load}
        >
          <RefreshCw className="mr-1.5 h-4 w-4" /> Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-5 py-2 pb-24">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EB5017] via-[#D94512] to-[#B33A0F] p-6 shadow-lg sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white shadow-lg backdrop-blur">
              <SettingsIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Configuration</p>
              <h1 className="mt-0.5 text-2xl font-black tracking-tight text-white sm:text-3xl">Platform settings</h1>
              <p className="mt-1 text-xs text-white/80">
                {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : "Changes take effect immediately after saving"}
              </p>
            </div>
          </div>
          {dirty && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* TABS — scrollable, more than fit */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all",
                active
                  ? "bg-gradient-to-r from-[#EB5017] to-[#B33A0F] text-white shadow-md shadow-[#EB5017]/25"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="space-y-4">

        {/* ═══════════════ GENERAL ═══════════════ */}
        {tab === "general" && (
          <>
            <Section title="Branding">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Site name">
                  <Input value={settings.general.siteName} onChange={(e) => update("general", { siteName: e.target.value })} className="rounded-lg" />
                </Field>
                <Field label="Site URL">
                  <Input value={settings.general.siteUrl} onChange={(e) => update("general", { siteUrl: e.target.value })} placeholder="https://paslearn.com" className="rounded-lg" />
                </Field>
              </div>
              <Field label="Tagline" hint="Appears in header, footer, and emails">
                <Input value={settings.general.siteTagline} onChange={(e) => update("general", { siteTagline: e.target.value })} className="rounded-lg" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo URL" hint="Public URL to your logo">
                  <Input value={settings.general.logoUrl} onChange={(e) => update("general", { logoUrl: e.target.value })} placeholder="https://cdn.paslearn.com/logo.svg" className="rounded-lg" />
                </Field>
                <Field label="Favicon URL">
                  <Input value={settings.general.faviconUrl} onChange={(e) => update("general", { faviconUrl: e.target.value })} placeholder="https://cdn.paslearn.com/favicon.ico" className="rounded-lg" />
                </Field>
              </div>
            </Section>

            <Section title="Contact">
              <Field label="Support email" hint="Used in transactional emails and the contact page.">
                <Input type="email" value={settings.general.supportEmail} onChange={(e) => update("general", { supportEmail: e.target.value })} className="rounded-lg" />
              </Field>
            </Section>

            <Section title="Maintenance mode">
              <ToggleRow
                label="Enable maintenance mode"
                description="Locks the public site behind a maintenance page. Admin panel stays accessible."
                checked={settings.general.maintenanceMode}
                onChange={(v) => update("general", { maintenanceMode: v })}
              />
              {settings.general.maintenanceMode && (
                <Field label="Maintenance message">
                  <Input value={settings.general.maintenanceMessage} onChange={(e) => update("general", { maintenanceMessage: e.target.value })} className="rounded-lg" />
                </Field>
              )}
            </Section>
          </>
        )}

        {/* ═══════════════ COMMERCE ═══════════════ */}
        {tab === "commerce" && (
          <>
            <Section title="Platform fees">
              <Field label="Platform fee %" hint="Percentage taken from every paid order (0–50%).">
                <NumberInput value={settings.commerce.platformFeePercent} onChange={(n) => update("commerce", { platformFeePercent: n })} min={0} max={50} step={0.5} suffix="%" />
              </Field>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-bold"><AlertCircle className="mr-1 inline h-3.5 w-3.5" />Changes apply to future orders only.</p>
                <p className="mt-0.5 text-[11px]">Existing orders keep their recorded fee.</p>
              </div>
            </Section>

            <Section title="Payouts">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum payout amount" hint="Teachers can't request below this.">
                  <NumberInput value={settings.commerce.minPayoutAmount} onChange={(n) => update("commerce", { minPayoutAmount: n })} min={0} suffix="$" />
                </Field>
                <Field label="Payout schedule">
                  <select
                    value={settings.commerce.payoutSchedule}
                    onChange={(e) => update("commerce", { payoutSchedule: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="manual">Manual — admin approves each request</option>
                    <option value="auto">Auto — create on 1st &amp; 15th</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Currency & tax">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default currency">
                  <select
                    value={settings.commerce.defaultCurrency}
                    onChange={(e) => update("commerce", { defaultCurrency: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    {["USD", "EUR", "GBP", "CAD", "AUD", "INR"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Tax">
                  <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3">
                    <input type="checkbox" id="tax-on" checked={settings.commerce.taxEnabled} onChange={(e) => update("commerce", { taxEnabled: e.target.checked })} className="h-4 w-4 rounded accent-[#EB5017]" />
                    <label htmlFor="tax-on" className="text-xs font-semibold text-slate-700">Enable tax calculation</label>
                  </div>
                </Field>
              </div>
              {settings.commerce.taxEnabled && (
                <Field label="Tax percent">
                  <NumberInput value={settings.commerce.taxPercent} onChange={(n) => update("commerce", { taxPercent: n })} min={0} max={100} step={0.5} suffix="%" />
                </Field>
              )}
            </Section>
          </>
        )}

        {/* ═══════════════ SUBSCRIPTIONS ═══════════════ */}
        {tab === "subscriptions" && (
          <>
            <Section title="Teacher platform subscriptions" subtitle="Free trial and grace period for teachers joining the platform">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Free trial days" hint="How many days a new teacher can use the platform before a paid plan starts.">
                  <NumberInput value={settings.subscriptions.freeTrialDays} onChange={(n) => update("subscriptions", { freeTrialDays: n })} min={0} suffix="days" />
                </Field>
                <Field label="Grace period" hint="Days after a failed payment before the account is suspended.">
                  <NumberInput value={settings.subscriptions.gracePeriodDays} onChange={(n) => update("subscriptions", { gracePeriodDays: n })} min={0} suffix="days" />
                </Field>
              </div>
              <Field label="Refund window" hint="Days a teacher can request a refund after paying.">
                <NumberInput value={settings.subscriptions.refundWindowDays} onChange={(n) => update("subscriptions", { refundWindowDays: n })} min={0} suffix="days" />
              </Field>
            </Section>

            <Section title="Plan changes">
              <div className="space-y-2">
                <ToggleRow label="Auto-renew by default" description="New subscriptions renew automatically unless cancelled." checked={settings.subscriptions.autoRenewByDefault} onChange={(v) => update("subscriptions", { autoRenewByDefault: v })} />
                <ToggleRow label="Allow upgrades" description="Teachers can move to a higher plan mid-cycle." checked={settings.subscriptions.allowUpgrade} onChange={(v) => update("subscriptions", { allowUpgrade: v })} />
                <ToggleRow label="Allow downgrades" description="Teachers can move to a lower plan (usually at period end)." checked={settings.subscriptions.allowDowngrade} onChange={(v) => update("subscriptions", { allowDowngrade: v })} />
                <ToggleRow label="Prorate on upgrade" description="Charge the difference immediately when upgrading." checked={settings.subscriptions.prorateOnUpgrade} onChange={(v) => update("subscriptions", { prorateOnUpgrade: v })} />
                <ToggleRow label="Cancel at period end" description="Cancellations take effect at the end of the billing cycle, not immediately." checked={settings.subscriptions.cancelAtPeriodEnd} onChange={(v) => update("subscriptions", { cancelAtPeriodEnd: v })} />
                <ToggleRow label="Require admin approval" description="New teacher applications need manual approval before activating." checked={settings.subscriptions.requiresApproval} onChange={(v) => update("subscriptions", { requiresApproval: v })} />
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ ADDONS ═══════════════ */}
        {tab === "addons" && (
          <>
            <Section title="Addon program" subtitle="One-off or recurring purchases teachers can make on top of their plan">
              <ToggleRow label="Addons enabled" description="Master switch — turning this off hides addons everywhere." checked={settings.addons.enabled} onChange={(v) => update("addons", { enabled: v })} />
              <ToggleRow label="Allow stacking" description="Teachers can buy multiple addons and stack them." checked={settings.addons.allowStacking} onChange={(v) => update("addons", { allowStacking: v })} />
              <ToggleRow label="Auto-enable for new teachers" description="Grant the default addon set to every new teacher." checked={settings.addons.autoEnableForNewTeachers} onChange={(v) => update("addons", { autoEnableForNewTeachers: v })} />
            </Section>

            <Section title="Defaults">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default trial days" hint="Trial period for paid addons (0 = no trial).">
                  <NumberInput value={settings.addons.defaultTrialDays} onChange={(n) => update("addons", { defaultTrialDays: n })} min={0} suffix="days" />
                </Field>
                <Field label="Minimum plan tier" hint="Teachers below this plan can't buy any addons.">
                  <select
                    value={settings.addons.minPlanTier}
                    onChange={(e) => update("addons", { minPlanTier: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="free_trial">Free trial</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="business">Business</option>
                  </select>
                </Field>
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ AI STUDIO ═══════════════ */}
        {tab === "ai" && (
          <>
            <Section title="AI Studio" subtitle="Provider, quotas, and rate limits for AI features">
              <ToggleRow label="AI Studio enabled" description="Master switch — turning this off hides all AI features from teachers." checked={settings.ai.enabled} onChange={(v) => update("ai", { enabled: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Active provider">
                  <select
                    value={settings.ai.provider}
                    onChange={(e) => update("ai", { provider: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="stub">Stub (dev — no API key)</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  </select>
                </Field>
                <Field label="Default model">
                  <Input value={settings.ai.defaultModel} onChange={(e) => update("ai", { defaultModel: e.target.value })} placeholder="gpt-4o-mini" className="rounded-lg font-mono text-xs" />
                </Field>
              </div>
              <Field label="Max requests per minute" hint="Per teacher. Protects against abuse.">
                <NumberInput value={settings.ai.maxRequestsPerMinute} onChange={(n) => update("ai", { maxRequestsPerMinute: n })} min={1} suffix="req/min" />
              </Field>
              <ToggleRow label="Monthly credit reset" description="Reset each teacher's AI credits on the 1st of every month." checked={settings.ai.monthlyReset} onChange={(v) => update("ai", { monthlyReset: v })} />
            </Section>

            <Section title="Credits per plan" subtitle="Monthly AI credits granted to each teacher based on their plan">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(["free_trial", "starter", "pro", "business"] as const).map((plan) => (
                  <Field key={plan} label={plan.replace("_", " ")}>
                    <NumberInput
                      value={settings.ai.creditsPerPlan[plan]}
                      onChange={(n) => update("ai", { creditsPerPlan: { ...settings.ai.creditsPerPlan, [plan]: n } })}
                      min={0}
                      suffix="credits"
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section title="Feature toggles">
              <div className="space-y-2">
                <ToggleRow label="AI chatbot" description="Teacher-facing chat assistant" checked={settings.ai.allowChatbot} onChange={(v) => update("ai", { allowChatbot: v })} />
                <ToggleRow label="Quiz generation" description="Generate quizzes from lesson content" checked={settings.ai.allowQuizGen} onChange={(v) => update("ai", { allowQuizGen: v })} />
                <ToggleRow label="Summarization" description="Auto-summarize long courses" checked={settings.ai.allowSummarization} onChange={(v) => update("ai", { allowSummarization: v })} />
                <ToggleRow label="Content generation" description="Generate course descriptions, outlines, tags" checked={settings.ai.allowContentGen} onChange={(v) => update("ai", { allowContentGen: v })} />
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ STORAGE ═══════════════ */}
        {tab === "storage" && (
          <>
            <Section title="Upload limits">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Max upload size" hint="Applies to all non-video uploads (thumbnails, PDFs, etc.).">
                  <NumberInput value={settings.storage.maxUploadMB} onChange={(n) => update("storage", { maxUploadMB: n })} min={1} suffix="MB" />
                </Field>
                <Field label="Max video upload size">
                  <NumberInput value={settings.storage.maxVideoUploadMB} onChange={(n) => update("storage", { maxVideoUploadMB: n })} min={1} suffix="MB" />
                </Field>
              </div>
            </Section>

            <Section title="Per-plan file size caps" subtitle="Teachers below a plan's cap get a clear rejection on upload">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(["free_trial", "starter", "pro", "business"] as const).map((plan) => (
                  <Field key={plan} label={plan.replace("_", " ")}>
                    <NumberInput
                      value={settings.storage.maxFileSizeByPlan[plan]}
                      onChange={(n) => update("storage", { maxFileSizeByPlan: { ...settings.storage.maxFileSizeByPlan, [plan]: n } })}
                      min={1}
                      suffix="MB"
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section title="Processing">
              <ToggleRow label="Video transcoding" description="Convert uploaded videos to multiple resolutions automatically." checked={settings.storage.videoTranscodingEnabled} onChange={(v) => update("storage", { videoTranscodingEnabled: v })} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Originals retention" hint="Days to keep original video files after transcoding.">
                  <NumberInput value={settings.storage.originalsRetentionDays} onChange={(n) => update("storage", { originalsRetentionDays: n })} min={0} suffix="days" />
                </Field>
                <Field label="CDN provider">
                  <select
                    value={settings.storage.cdnProvider}
                    onChange={(e) => update("storage", { cdnProvider: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="local">Local (dev)</option>
                    <option value="r2">Cloudflare R2</option>
                    <option value="mux">Mux</option>
                    <option value="bunny">Bunny</option>
                  </select>
                </Field>
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ EMAIL ═══════════════ */}
        {tab === "email" && (
          <>
            <Section title="Sender identity" subtitle="From address used on all outbound emails">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From name">
                  <Input value={settings.email.fromName} onChange={(e) => update("email", { fromName: e.target.value })} className="rounded-lg" />
                </Field>
                <Field label="From email">
                  <Input type="email" value={settings.email.fromEmail} onChange={(e) => update("email", { fromEmail: e.target.value })} className="rounded-lg" />
                </Field>
              </div>
              <Field label="Reply-to email" hint="Where replies go when a user hits Reply.">
                <Input type="email" value={settings.email.replyToEmail} onChange={(e) => update("email", { replyToEmail: e.target.value })} className="rounded-lg" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Daily send limit" hint="Protects against runaway loops.">
                  <NumberInput value={settings.email.dailySendLimit} onChange={(n) => update("email", { dailySendLimit: n })} min={0} suffix="emails/day" />
                </Field>
                <Field label="Unsubscribe policy">
                  <select
                    value={settings.email.unsubscribePolicy}
                    onChange={(e) => update("email", { unsubscribePolicy: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="end_of_quarter">End of quarter</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Per-event toggles">
              <div className="space-y-2">
                <ToggleRow label="Welcome email" description="Sent to new users after signup" checked={settings.email.welcomeEnabled} onChange={(v) => update("email", { welcomeEnabled: v })} />
                <ToggleRow label="Receipt email" description="Sent after a successful payment" checked={settings.email.receiptEnabled} onChange={(v) => update("email", { receiptEnabled: v })} />
                <ToggleRow label="Review notification" description="Sent to teachers when a student reviews their course" checked={settings.email.reviewEnabled} onChange={(v) => update("email", { reviewEnabled: v })} />
                <ToggleRow label="Payout notification" description="Sent to teachers when a payout is approved or paid" checked={settings.email.payoutEnabled} onChange={(v) => update("email", { payoutEnabled: v })} />
                <ToggleRow label="Marketing campaigns" description="Allow teachers to send promotional emails to their students" checked={settings.email.marketingEnabled} onChange={(v) => update("email", { marketingEnabled: v })} />
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ SECURITY ═══════════════ */}
        {tab === "security" && (
          <>
            <Section title="Login protection">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Max login attempts" hint="Failed attempts before temporary lockout.">
                  <NumberInput value={settings.security.maxLoginAttempts} onChange={(n) => update("security", { maxLoginAttempts: n })} min={1} suffix="attempts" />
                </Field>
                <Field label="Lockout duration">
                  <NumberInput value={settings.security.lockoutMinutes} onChange={(n) => update("security", { lockoutMinutes: n })} min={1} suffix="minutes" />
                </Field>
              </div>
            </Section>

            <Section title="Two-factor authentication">
              <div className="space-y-2">
                <ToggleRow label="Require 2FA for admins" description="Admins must set up 2FA before their next login." checked={settings.security.require2FAForAdmins} onChange={(v) => update("security", { require2FAForAdmins: v })} />
                <ToggleRow label="Require 2FA for teachers" description="Teachers must set up 2FA before accessing the platform." checked={settings.security.require2FAForTeachers} onChange={(v) => update("security", { require2FAForTeachers: v })} />
              </div>
            </Section>

            <Section title="Sessions">
              <Field label="Session duration" hint="Users are signed out after this period of inactivity.">
                <NumberInput value={settings.security.sessionDurationHours} onChange={(n) => update("security", { sessionDurationHours: n })} min={1} suffix="hours" />
              </Field>
            </Section>

            <Section title="Password policy">
              <Field label="Minimum password length">
                <NumberInput value={settings.security.minPasswordLength} onChange={(n) => update("security", { minPasswordLength: n })} min={6} suffix="chars" />
              </Field>
              <div className="space-y-2">
                <ToggleRow label="Require uppercase" description="At least one uppercase letter." checked={settings.security.requirePasswordUppercase} onChange={(v) => update("security", { requirePasswordUppercase: v })} />
                <ToggleRow label="Require number" description="At least one digit." checked={settings.security.requirePasswordNumber} onChange={(v) => update("security", { requirePasswordNumber: v })} />
                <ToggleRow label="Require symbol" description="At least one special character." checked={settings.security.requirePasswordSymbol} onChange={(v) => update("security", { requirePasswordSymbol: v })} />
              </div>
            </Section>

            <Section title="Data retention">
              <Field label="Deleted content retention" hint="Days to keep soft-deleted data before permanent purge. 0 = forever.">
                <NumberInput value={settings.security.dataRetentionDays} onChange={(n) => update("security", { dataRetentionDays: n })} min={0} suffix="days" />
              </Field>
            </Section>
          </>
        )}

        {/* ═══════════════ FEATURES ═══════════════ */}
        {tab === "features" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#EB5017]/20 bg-[#FEF3EE] p-4">
              <p className="text-xs font-bold text-[#EB5017]">
                <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
                These are platform-wide master switches.
              </p>
              <p className="mt-1 text-[11px] text-[#B83A0D]">
                Turning a feature off here disables it for <strong>everyone</strong>, regardless of plan.
                Per-plan and per-addon feature access is managed in the <strong>Plans &amp; Pricing</strong> and{" "}
                <strong>Addons</strong> modules. Adding new features happens in the <strong>Feature Registry</strong>.
              </p>
            </div>

            <Section title="Global feature kill switches" subtitle="Emergency off. Leave ON when the feature is operating normally.">
              <div className="grid gap-2 sm:grid-cols-2">
                  <ToggleRow label="Digital files" description="Allow teachers to upload and sell files" checked={settings.features.digitalFiles} onChange={(v) => update("features", { digitalFiles: v })} />
                  <ToggleRow label="Online coaching" description="1-on-1 sessions and bookings" checked={settings.features.coaching} onChange={(v) => update("features", { coaching: v })} />
                  <ToggleRow label="Online chat" description="Real-time messaging between teachers and students" checked={settings.features.onlineChat} onChange={(v) => update("features", { onlineChat: v })} />
                  <ToggleRow label="Affiliate program" description="Referral tracking and commissions" checked={settings.features.affiliateProgram} onChange={(v) => update("features", { affiliateProgram: v })} />
                  <ToggleRow label="Coupons" description="Discount codes at checkout" checked={settings.features.coupons} onChange={(v) => update("features", { coupons: v })} />
                  <ToggleRow label="AI Studio" description="AI-generated course content and quizzes" checked={settings.features.aiStudio} onChange={(v) => update("features", { aiStudio: v })} />
                  <ToggleRow label="Website builder" description="Teacher personal sites and landing pages" checked={settings.features.websiteBuilder} onChange={(v) => update("features", { websiteBuilder: v })} />
                  <ToggleRow label="Email marketing" description="Teacher → student email campaigns" checked={settings.features.emailMarketing} onChange={(v) => update("features", { emailMarketing: v })} />
                  <ToggleRow label="Form builder" description="Custom forms, lead magnets, survey submissions" checked={settings.features.formBuilder} onChange={(v) => update("features", { formBuilder: v })} />
              </div>
            </Section>
          </div>
        )}

        {/* ═══════════════ AFFILIATE ═══════════════ */}
        {tab === "affiliate" && (
          <>
            <Section title="Affiliate program">
              <ToggleRow label="Affiliate program enabled" description="Master switch — disables tracking and payouts platform-wide." checked={settings.affiliate.enabled} onChange={(v) => update("affiliate", { enabled: v })} />
            </Section>
            <Section title="Commission defaults">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default commission type">
                  <select
                    value={settings.affiliate.defaultCommissionValueType}
                    onChange={(e) => update("affiliate", { defaultCommissionValueType: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="flat">Flat amount</option>
                  </select>
                </Field>
                <Field label="Default value" hint="Teachers can override per product.">
                  <NumberInput value={settings.affiliate.defaultCommissionValue} onChange={(n) => update("affiliate", { defaultCommissionValue: n })} min={0} />
                </Field>
              </div>
            </Section>
            <Section title="Holds & withdrawals">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Commission hold" hint="Days commissions stay pending before becoming available.">
                  <NumberInput value={settings.affiliate.holdDays} onChange={(n) => update("affiliate", { holdDays: n })} min={0} suffix="days" />
                </Field>
                <Field label="Minimum withdrawal">
                  <NumberInput value={settings.affiliate.minWithdrawal} onChange={(n) => update("affiliate", { minWithdrawal: n })} min={0} suffix="$" />
                </Field>
              </div>
            </Section>
          </>
        )}

        {/* ═══════════════ LEGAL ═══════════════ */}
        {tab === "legal" && (
          <>
            <Section title="Policy pages">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Terms of service URL">
                  <Input value={settings.legal.termsUrl} onChange={(e) => update("legal", { termsUrl: e.target.value })} placeholder="/terms" className="rounded-lg" />
                </Field>
                <Field label="Privacy policy URL">
                  <Input value={settings.legal.privacyUrl} onChange={(e) => update("legal", { privacyUrl: e.target.value })} placeholder="/privacy" className="rounded-lg" />
                </Field>
                <Field label="Refund policy URL">
                  <Input value={settings.legal.refundPolicyUrl} onChange={(e) => update("legal", { refundPolicyUrl: e.target.value })} placeholder="/refund-policy" className="rounded-lg" />
                </Field>
                <Field label="Cookie policy URL">
                  <Input value={settings.legal.cookiePolicyUrl} onChange={(e) => update("legal", { cookiePolicyUrl: e.target.value })} placeholder="/cookies" className="rounded-lg" />
                </Field>
                <Field label="DMCA / copyright URL">
                  <Input value={settings.legal.dmcaUrl} onChange={(e) => update("legal", { dmcaUrl: e.target.value })} placeholder="/dmca" className="rounded-lg" />
                </Field>
                <Field label="Minimum user age" hint="Users below this age can't sign up.">
                  <NumberInput value={settings.legal.minimumAge} onChange={(n) => update("legal", { minimumAge: n })} min={0} suffix="years" />
                </Field>
              </div>
            </Section>
            <Section title="Company details" subtitle="Shown on invoices and receipts.">
              <Field label="Company name">
                <Input value={settings.legal.companyName} onChange={(e) => update("legal", { companyName: e.target.value })} className="rounded-lg" />
              </Field>
              <Field label="Company address">
                <textarea
                  value={settings.legal.companyAddress}
                  onChange={(e) => update("legal", { companyAddress: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#EB5017] focus:outline-none focus:ring-2 focus:ring-[#FEE9DE]"
                />
              </Field>
              <Field label="VAT / Tax ID">
                <Input value={settings.legal.vatNumber} onChange={(e) => update("legal", { vatNumber: e.target.value })} className="rounded-lg" />
              </Field>
            </Section>
          </>
        )}

        {/* ═══════════════ HEALTH ═══════════════ */}
        {tab === "health" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-700">Integration health</h3>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Stripe and PayPal get a real connection test. Others report env-var status only.
                  </p>
                </div>
                <Button
                  onClick={loadHealth}
                  disabled={healthLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", healthLoading && "animate-spin")} /> Refresh all
                </Button>
              </div>
            </div>
            <div className="p-4">
              {healthLoading && !health ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
                </div>
              ) : health ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <HealthCard
                    name="Stripe"
                    connected={health.stripe?.connected === true}
                    envSet={health.stripe?.secretKeySet === true}
                    extras={[
                      `Secret key: ${health.stripe?.secretKeySet ? "✓ set" : "✗ missing"}`,
                      `Webhook secret: ${health.stripe?.webhookSecretSet ? "✓ set" : "⚠ not set"}`,
                      `Publishable key: ${health.stripe?.publishableKeySet ? "✓ set (frontend)" : "⚠ frontend var not detected"}`,
                    ]}
                    error={health.stripe?.error}
                    testable
                    serviceKey="stripe"
                  />
                  <HealthCard
                    name={`PayPal (${health.paypal?.mode || "sandbox"})`}
                    connected={health.paypal?.connected === true}
                    envSet={health.paypal?.clientIdSet === true && health.paypal?.clientSecretSet === true}
                    extras={[
                      `Client ID: ${health.paypal?.clientIdSet ? "✓ set" : "✗ missing"}`,
                      `Secret: ${health.paypal?.clientSecretSet ? "✓ set" : "✗ missing"}`,
                      `Webhook ID: ${health.paypal?.webhookIdSet ? "✓ set" : "⚠ not set"}`,
                    ]}
                    error={health.paypal?.error}
                    testable
                    serviceKey="paypal"
                  />
                  <HealthCard
                    name="SMTP"
                    connected={health.smtp?.configured === true}
                    envSet={health.smtp?.configured === true}
                    extras={[
                      `Host: ${health.smtp?.host || "not set"}`,
                      health.smtp?.configured ? "Emails will send" : "Set SMTP_HOST, SMTP_USER, SMTP_PASS",
                    ]}
                  />
                  <HealthCard
                    name="Cloudflare R2"
                    connected={health.cloudflareR2?.configured === true}
                    envSet={health.cloudflareR2?.configured === true}
                    extras={[
                      health.cloudflareR2?.configured ? "Media storage ready" : "Missing R2 credentials",
                    ]}
                  />
                  <HealthCard
                    name="Mux"
                    connected={health.mux?.configured === true}
                    envSet={health.mux?.configured === true}
                    extras={[health.mux?.configured ? "Video transcoding ready" : "Not configured"]}
                  />
                  <HealthCard
                    name="Bunny CDN"
                    connected={health.bunny?.configured === true}
                    envSet={health.bunny?.configured === true}
                    extras={[health.bunny?.configured ? "CDN ready" : "Not configured"]}
                  />
                  <HealthCard
                    name="OpenAI"
                    connected={health.ai?.openai === true}
                    envSet={health.ai?.openai === true}
                    extras={[
                      health.ai?.openai ? "API key present" : "Missing OPENAI_API_KEY",
                      `Active provider: ${health.ai?.activeProvider || "stub"}`,
                    ]}
                  />
                  <HealthCard
                    name="Anthropic"
                    connected={health.ai?.anthropic === true}
                    envSet={health.ai?.anthropic === true}
                    extras={[health.ai?.anthropic ? "API key present" : "Missing ANTHROPIC_API_KEY"]}
                  />
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">Click refresh to load integration status.</p>
              )}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* STICKY SAVE BAR */}
      {dirty && (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-[#FFE1C7] bg-white px-4 py-3 shadow-2xl ring-1 ring-[#EB5017]/20">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#EB5017]" />
            <p className="text-sm font-bold text-slate-900">Unsaved changes</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={reset} disabled={saving} className="h-9 rounded-lg">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
            </Button>
            <Button
              size="sm"
              onClick={save}
              disabled={saving}
              className="h-9 rounded-lg bg-gradient-to-r from-[#EB5017] to-[#B33A0F] font-bold text-white shadow-md shadow-[#EB5017]/25"
            >
              {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Saving…</> : <><Save className="mr-1.5 h-3.5 w-3.5" /> Save changes</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Health card
// ═══════════════════════════════════════════════════════════════

function HealthCard({
  name, connected, envSet, extras, error, testable, serviceKey,
}: {
  name: string;
  connected: boolean;
  envSet: boolean;
  extras: string[];
  error?: string;
  testable?: boolean;
  serviceKey?: string;
}) {
  const [testing, setTesting] = useState(false);
  const [lastTest, setLastTest] = useState<"ok" | "fail" | null>(null);

  const runTest = async () => {
    if (!serviceKey) return;
    setTesting(true);
    setLastTest(null);
    try {
      const r = await api.post(`/admin/settings/test/${serviceKey}`);
      const res = r.data?.data?.result;
      const ok = res?.connected === true || res?.configured === true || res === true;
      setLastTest(ok ? "ok" : "fail");
      toast.success(`${name} connection OK`, { description: "Live test passed." });
    } catch (e: any) {
      setLastTest("fail");
      toast.error(`${name} connection failed`, { description: e?.response?.data?.message || "Check env vars" });
    } finally {
      setTesting(false);
    }
  };

  const isConnected = connected && lastTest !== "fail";

  return (
    <div className={cn(
      "rounded-xl border p-3",
      isConnected ? "border-emerald-200 bg-emerald-50/40" : envSet ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-slate-50"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isConnected ? "bg-[#E7F6EC] text-[#036B26]" : envSet ? "bg-[#FFF6E5] text-[#B54708]" : "bg-slate-200 text-slate-500"
        )}>
          {isConnected ? <CheckCircle2 className="h-4 w-4" /> : envSet ? <AlertCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black text-slate-900">{name}</p>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
              isConnected ? "bg-[#E7F6EC] text-[#036B26]" : envSet ? "bg-[#FFF6E5] text-[#B54708]" : "bg-slate-200 text-slate-600"
            )}>
              {isConnected ? "Connected" : envSet ? "Configured" : "Missing"}
            </span>
          </div>
          <div className="mt-1.5 space-y-0.5">
            {extras.map((ex, i) => (
              <p key={i} className="text-[10px] text-slate-600">{ex}</p>
            ))}
          </div>
          {error && (
            <p className="mt-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
              {error}
            </p>
          )}
          {testable && (
            <Button
              size="sm"
              variant="outline"
              onClick={runTest}
              disabled={testing}
              className="mt-2 h-7 rounded-md text-[10px]"
            >
              {testing ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Testing…</>
              ) : (
                <><Activity className="mr-1 h-3 w-3" /> Test connection</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}