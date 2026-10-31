"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Award,
  Loader2,
  ExternalLink,
  BookOpen,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface Certificate {
  _id: string;
  certificateNumber: string;
  verificationSlug: string;
  issuedAt: string;
  course?: { title: string; slug: string };
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get("/certificates/my");
        setCertificates(r.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">
          Achievements
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
          My Certificates
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {certificates.length === 0
            ? "Complete a course to earn your first certificate"
            : `${certificates.length} certificate${certificates.length === 1 ? "" : "s"} earned`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0177FB]" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50/30 to-white py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/25">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h3 className="mt-5 text-xl font-black text-slate-900">
            No certificates yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {`Complete a course's requirements and you'll automatically earn a
            certificate you can share with employers.`}
          </p>
          <Link href="/student/courses">
            <Button className="mt-6 rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold shadow-lg shadow-[#0177FB]/25">
              <BookOpen className="mr-2 h-4 w-4" /> View my courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="group relative overflow-hidden rounded-2xl border-2 border-amber-200/60 bg-gradient-to-br from-white via-amber-50/40 to-yellow-50/30 shadow-sm transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl"
            >
              <div className="absolute right-0 top-0 h-16 w-16 overflow-hidden">
                <div className="absolute -right-8 top-4 w-24 rotate-45 bg-gradient-to-r from-amber-500 to-yellow-500 py-1 text-center text-[9px] font-black uppercase tracking-widest text-white shadow-md">
                  Awarded
                </div>
              </div>

              <div className="p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-110">
                  <Award className="h-7 w-7 text-white" />
                </div>

                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-amber-700">
                  Certificate of completion
                </p>
                <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-base font-black leading-tight text-slate-900">
                  {cert.course?.title || "Course Certificate"}
                </h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Issued{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="font-mono text-[10px] text-slate-500">
                    {cert.certificateNumber}
                  </p>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/certificates/${cert.verificationSlug}`}
                    className="flex-1"
                    target="_blank"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-lg border-amber-300 font-bold text-amber-700 hover:bg-amber-50"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View
                    </Button>
                  </Link>
                  {cert.course?.slug && (
                    <Link href={`/student/learn/${cert.course.slug}`} className="flex-1">
                      <Button
                        size="sm"
                        className="w-full rounded-lg bg-gradient-to-r from-[#0177FB] to-[#0156C7] font-bold"
                      >
                        <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Course
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}