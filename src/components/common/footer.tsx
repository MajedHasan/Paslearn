import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import {
  Facebook,
  Linkedin,
  Mail,
  MapPinIcon,
  Phone,
  Twitter,
} from "lucide-react";
import { Separator } from "../ui/separator";

type Props = {};

const Footer = (props: Props) => {
  return (
    <div className="bg-slate-100 py-8">
      <div className="container mx-auto">
        <footer className="grid grid-cols-1 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 col-span-1">
            <Link
              href={"/"}
              className="w-10 h-10 rounded bg-black block"
            ></Link>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={"mailto:coursehub@gmail.com"}
                className="flex items-center gap-2"
              >
                <Mail size={15} />
                <span className="text-sm">coursehub@gamil.com</span>
              </Link>
              <Link
                href={"tel:+212522675423"}
                className="flex items-center gap-2"
              >
                <Phone size={15} />
                <span className="text-sm">+212 522675423</span>
              </Link>
              <Link
                href={"https://maps.google.com"}
                className="flex items-center gap-2"
              >
                <MapPinIcon size={15} />
                <span className="text-sm">Somewhere in Morocco</span>
              </Link>
            </div>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-3">Home</h2>
            <Separator className="mb-3" />
            <ul>
              <li>
                <Link href={""}>Benefits</Link>
              </li>
              <li>
                <Link href={""}>Our Courses</Link>
              </li>
              <li>
                <Link href={""}>Our Testimonials</Link>
              </li>
              <li>
                <Link href={""}>Our FAQ</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-3">About Us</h2>
            <Separator className="mb-3" />
            <ul>
              <li>
                <Link href={""}>Company</Link>
              </li>
              <li>
                <Link href={""}>Achievements</Link>
              </li>
              <li>
                <Link href={""}>Our Goals</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-1">
            <h2 className="text-xl font-bold mb-3">Social Profiles</h2>
            <Separator className="mb-3" />
            <nav className="flex items-center gap-7">
              <Link href={"/"}>
                <Facebook
                  size={40}
                  className="bg-black text-white rounded-full p-2"
                />
              </Link>
              <Link href={"/"}>
                <Twitter
                  size={40}
                  className="bg-black text-white rounded-full p-2"
                />
              </Link>
              <Link href={"/"}>
                <Linkedin
                  size={40}
                  className="bg-black text-white rounded-full p-2"
                />
              </Link>
            </nav>
          </div>
        </footer>
        <div className="mt-5">
          <Separator className="mb-4" />
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Course creator hub. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
