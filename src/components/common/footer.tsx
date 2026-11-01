import Link from "next/link";
import React from "react";
import {
  Facebook,
  Linkedin,
  Mail,
  MapPinIcon,
  Phone,
  Twitter,
  GraduationCap,
  Instagram,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-gradient-to-br from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0177FB] to-[#0156C7] shadow-lg shadow-[#0177FB]/25">
                <GraduationCap className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Paslearn
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
              The all-in-one platform for creators to teach, sell, and grow.
              Build your course, launch your business.
            </p>
            <div className="mt-5 space-y-2">
              <Link
                href="mailto:contact@paslearn.com"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0177FB]"
              >
                <Mail className="h-4 w-4" />
                contact@paslearn.com
              </Link>
              <Link
                href="tel:+212522675423"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#0177FB]"
              >
                <Phone className="h-4 w-4" />
                +212 522 675 423
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPinIcon className="h-4 w-4" />
                Paris, France
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                Learn
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/courses" className="text-slate-600 hover:text-[#0177FB]">All courses</Link></li>
                <li><Link href="/courses?priceModel=free" className="text-slate-600 hover:text-[#0177FB]">Free courses</Link></li>
                <li><Link href="/courses" className="text-slate-600 hover:text-[#0177FB]">Categories</Link></li>
                <li><Link href="/certificates" className="text-slate-600 hover:text-[#0177FB]">Verify certificate</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                Teach
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/teacher/courses/new" className="text-slate-600 hover:text-[#0177FB]">Become an instructor</Link></li>
                <li><Link href="/auth/sign-up" className="text-slate-600 hover:text-[#0177FB]">Teacher sign up</Link></li>
                <li><Link href="/pricing" className="text-slate-600 hover:text-[#0177FB]">Pricing plans</Link></li>
                <li><Link href="/student/affiliate" className="text-slate-600 hover:text-[#0177FB]">Affiliate program</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                Company
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/about-us" className="text-slate-600 hover:text-[#0177FB]">About us</Link></li>
                <li><Link href="/contact" className="text-slate-600 hover:text-[#0177FB]">Contact</Link></li>
                <li><Link href="/marketplace" className="text-slate-600 hover:text-[#0177FB]">Marketplace</Link></li>
                <li><Link href="/wait-list" className="text-slate-600 hover:text-[#0177FB]">Wait list</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">
                Follow
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Linkedin, label: "LinkedIn" },
                  { icon: Youtube, label: "YouTube" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:-translate-y-0.5 hover:text-[#0177FB] hover:shadow-md"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Paslearn. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/cookies" className="hover:text-slate-900">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;