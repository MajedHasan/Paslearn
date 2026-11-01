"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Building2,
  User,
  Globe,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type Method = "paypal" | "manual";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAmount: number;
  onSuccess: () => void;
}

const METHODS = [
  {
    value: "paypal" as Method,
    label: "PayPal",
    min: 50,
    icon: Mail,
    hint: "Fastest — sent directly to your PayPal email",
  },
  {
    value: "manual" as Method,
    label: "Bank Transfer",
    min: 100,
    icon: Building2,
    hint: "Wire transfer to your bank account (1-3 business days)",
  },
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Spain", "Italy", "India", "Bangladesh",
  "Pakistan", "Brazil", "Mexico", "Japan", "Singapore", "UAE", "Other",
];

export function WithdrawTeacherModal({
  open,
  onOpenChange,
  availableAmount,
  onSuccess,
}: Props) {
  const [method, setMethod] = useState<Method>("paypal");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PayPal
  const [paypalEmail, setPaypalEmail] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  // Bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [country, setCountry] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [additionalNote, setAdditionalNote] = useState("");

  const currentMethod = METHODS.find((m) => m.value === method)!;
  const min = currentMethod.min;
  const canWithdraw = availableAmount >= min;

  useEffect(() => {
    if (!open) return;
    setAmount(availableAmount.toFixed(2));
    setError(null);
    setSubmitting(false);
  }, [open, availableAmount]);

  const submit = async () => {
    setError(null);
    const n = parseFloat(amount);

    if (!n || isNaN(n)) return setError("Enter a valid amount");
    if (n <= 0) return setError("Amount must be greater than $0");
    if (n > availableAmount)
      return setError(`Maximum available: $${availableAmount.toFixed(2)}`);
    if (n < min) return setError(`Minimum for ${currentMethod.label} is $${min}`);

    const methodDetails: Record<string, any> = {};
    if (method === "paypal") {
      if (!paypalEmail.trim()) return setError("PayPal email is required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail))
        return setError("Invalid PayPal email format");
      if (!accountHolderName.trim())
        return setError("Account holder name is required");
      methodDetails.paypalEmail = paypalEmail.trim();
      methodDetails.accountHolderName = accountHolderName.trim();
    } else {
      if (!accountHolderName.trim())
        return setError("Account holder name is required");
      if (!bankName.trim()) return setError("Bank name is required");
      if (!accountNumber.trim())
        return setError("IBAN or account number is required");
      if (!country) return setError("Country is required");
      methodDetails.accountHolderName = accountHolderName.trim();
      methodDetails.bankName = bankName.trim();
      methodDetails.accountNumber = accountNumber.trim();
      methodDetails.country = country;
      if (swiftCode.trim()) methodDetails.swiftCode = swiftCode.trim();
      if (additionalNote.trim())
        methodDetails.additionalNote = additionalNote.trim();
    }

    setSubmitting(true);
    try {
      await api.post("/teacher/payouts/request", {
        amount: n,
        method,
        methodDetails,
      });
      toast.success(
        `Payout of $${n.toFixed(2)} requested. Admin will process within 1-3 business days.`
      );
      onOpenChange(false);
      onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to request payout";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            Request payout
          </DialogTitle>
          <DialogDescription>
            Available to withdraw:{" "}
            <strong className="text-emerald-700">
              ${availableAmount.toFixed(2)}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canWithdraw && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed text-amber-800">
                You need at least <strong>${min}</strong> in available balance
                to withdraw via {currentMethod.label}. You have $
                {availableAmount.toFixed(2)} available.
              </p>
            </div>
          )}

          {/* Method */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Payout method
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethod(m.value)}
                    className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all ${
                      active
                        ? "border-[#0177FB] bg-[#0177FB]/5"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {active && (
                      <CheckCircle2 className="absolute right-2 top-2 h-3.5 w-3.5 text-[#0177FB]" />
                    )}
                    <Icon
                      className={`h-4 w-4 ${
                        active ? "text-[#0177FB]" : "text-slate-400"
                      }`}
                    />
                    <p
                      className={`text-xs font-black ${
                        active ? "text-[#0177FB]" : "text-slate-900"
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-[10px] text-slate-500">min ${m.min}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">
              {currentMethod.hint}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-slate-500">
              Amount (USD)
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <Input
                type="number"
                min={min}
                max={availableAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg pl-7"
                disabled={!canWithdraw}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">
                Min ${min} · Max ${availableAmount.toFixed(2)}
              </span>
              {canWithdraw && (
                <button
                  type="button"
                  onClick={() => setAmount(availableAmount.toFixed(2))}
                  className="font-bold text-[#0177FB] hover:underline"
                >
                  Withdraw all
                </button>
              )}
            </div>
          </div>

          {/* PayPal / Bank fields */}
          {method === "paypal" ? (
            <>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> Account holder name
                </label>
                <Input
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="As shown on your PayPal account"
                  className="mt-1.5 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> PayPal email
                </label>
                <Input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 rounded-lg"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <User className="h-3 w-3" /> Account holder name
                </label>
                <Input
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Full legal name on bank account"
                  className="mt-1.5 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> Bank name
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Chase, Barclays, HSBC"
                  className="mt-1.5 rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> IBAN / Account number
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="IBAN or account number"
                  className="mt-1.5 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Country
                </label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-1.5 rounded-lg">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  SWIFT / BIC (international)
                </label>
                <Input
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  placeholder="Optional"
                  className="mt-1.5 rounded-lg font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Additional note (optional)
                </label>
                <Textarea
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  rows={2}
                  placeholder="Any special instructions"
                  className="mt-1.5 rounded-lg text-xs"
                />
              </div>
            </>
          )}

          {/* Preview */}
          {canWithdraw && parseFloat(amount) >= min && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                {`You'll`} receive ${parseFloat(amount).toFixed(2)} via{" "}
                {currentMethod.label}
              </div>
              <p className="mt-1 text-[10px] text-emerald-700">
                Processed within 1-3 business days after admin approval.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold shadow-md shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700"
              onClick={submit}
              disabled={submitting || !canWithdraw || parseFloat(amount || "0") < min}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Request payout
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}