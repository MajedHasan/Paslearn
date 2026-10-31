"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Award,
  CheckCircle2,
  Shield,
  Home,
  ExternalLink,
  Share2,
  Loader2,
  XCircle,
  Calendar,
  User,
  BookOpen,
  GraduationCap,
  Printer,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface CertificateData {
  certificateNumber: string;
  issuedAt: string;
  revoked: boolean;
  revokeReason?: string;
  studentName: string;
  courseTitle: string;
  courseSlug: string;
  teacherName: string;
}

export default function PublicCertificatePage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/certificates/verify/${slug}`);
      setData(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Certificate not found");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data
            ? `${data.studentName} completed ${data.courseTitle}`
            : "Certificate",
          text: "Verified certificate of completion from Paslearn",
          url: shareUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ═══════════════════ LOADING ═══════════════════
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
          <p className="text-sm text-slate-500">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════ ERROR ═══════════════════
  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <XCircle className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Certificate not found
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error ||
            "This certificate link may be invalid or the certificate has been revoked."}
        </p>
        <Link href="/" className="mt-6">
          <Button className="rounded-lg bg-[#0177FB] hover:bg-[#0156C7]">
            <Home className="mr-2 h-4 w-4" /> Go home
          </Button>
        </Link>
      </div>
    );
  }

  // ═══════════════════ REVOKED ═══════════════════
  if (data.revoked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
          <XCircle className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-slate-900">
          Certificate revoked
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-500">
          {data.revokeReason ||
            "This certificate is no longer valid. Please contact the issuing instructor for details."}
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-2 font-mono text-xs text-slate-500">
          {data.certificateNumber}
        </div>
        <Link href="/" className="mt-6">
          <Button className="rounded-lg bg-[#0177FB] hover:bg-[#0156C7]">
            <Home className="mr-2 h-4 w-4" /> Go home
          </Button>
        </Link>
      </div>
    );
  }

  // ═══════════════════ MAIN ═══════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 print:bg-white">
      {/* Top bar — hidden when printing */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-sm">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black text-slate-900">Paslearn</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-lg"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="rounded-lg bg-[#0177FB] font-bold hover:bg-[#0156C7]"
            >
              {copied ? (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Share"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Certificate card */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-200/60 bg-white shadow-2xl shadow-amber-500/10 print:border-2 print:shadow-none">
          {/* Decorative corner ribbons */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-[#0177FB]/10 to-violet-400/10 blur-3xl" />

          {/* Fine border frame */}
          <div className="absolute inset-3 rounded-2xl border-2 border-dashed border-amber-200/60 print:border-solid" />

          <div className="relative p-8 text-center sm:p-12 lg:p-16">
            {/* Medal */}
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/40 ring-8 ring-amber-100">
              <Award className="h-12 w-12 text-white" />
            </div>

            {/* Eyebrow */}
            <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-amber-600">
              Certificate of Completion
            </p>

            {/* Divider */}
            <div className="mx-auto mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-amber-300" />
              <Shield className="h-3 w-3 text-amber-500" />
              <div className="h-px w-12 bg-amber-300" />
            </div>

            {/* Awarded to */}
            <p className="mt-6 text-sm text-slate-500">
              This certifies that
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              {data.studentName}
            </h1>

            <p className="mt-4 text-sm text-slate-500">
              has successfully completed
            </p>

            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-black leading-snug text-[#0177FB] sm:text-3xl">
              {data.courseTitle}
            </h2>

            {/* Teacher */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <span>
                Taught by{" "}
                <span className="font-bold text-slate-900">
                  {data.teacherName}
                </span>
              </span>
            </div>

            {/* Meta grid */}
            <div className="mt-10 grid grid-cols-1 gap-4 border-t-2 border-dashed border-slate-200 pt-8 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Certificate ID
                </p>
                <p className="mt-1 font-mono text-xs font-bold text-slate-900">
                  {data.certificateNumber}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Issued
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-slate-900">
                  <Calendar className="h-3 w-3" />
                  {new Date(data.issuedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Status
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 text-xs font-bold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </p>
              </div>
            </div>

            {/* Verified badge */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <Shield className="h-3.5 w-3.5" />
              Verified by Paslearn
            </div>

            {/* Signature line */}
            <div className="mt-10 flex flex-col items-center justify-center gap-1 border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-500">Issued on behalf of</p>
              <p className="text-lg font-black italic text-slate-900">
                Paslearn Learning Platform
              </p>
            </div>
          </div>
        </div>

        {/* Below-card actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
          {data.courseSlug && (
            <Link href={`/courses/${data.courseSlug}`}>
              <Button variant="outline" className="rounded-lg">
                <BookOpen className="mr-2 h-4 w-4" />
                View course
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={handleShare}
            className="rounded-lg"
          >
            {copied ? (
              <Copy className="mr-2 h-4 w-4" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Link copied" : "Share certificate"}
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-slate-400 print:hidden">
          This certificate can be verified at any time by visiting this URL.
        </p>
      </main>
    </div>
  );
}