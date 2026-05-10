import ContactForm from "@/components/forms/contactForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

const ContactPage = (props: Props) => {
  return (
    <main className="container mx-auto md:px-0 px-2">
      <h1 className="md:text-5xl text-3xl font-bold text-center md:my-28 my-16">
        Contact Page
      </h1>
      <section className="shadow rounded py-7 px-8 w-full mb-20 grid lg:grid-cols-4 grid-cols-1 gap-10 bg-slate-50">
        <ContactForm />
        <div className="flex flex-col gap-6">
          <Card className="text-center">
            <CardHeader>
              <Button asChild variant={"outline"} className="w-fit mx-auto">
                <Link href={"mailto:hub@gamil.com"}>
                  <Mail />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <CardDescription>
                <Link href={"mailto:hub@gmail.com"}>
                  Course creator hub@gmail.com
                </Link>
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Button asChild variant={"outline"} className="w-fit mx-auto">
                <Link href={"tel:+212522675423"}>
                  <Phone />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <CardDescription>
                <Link href={"tel:+212522675423"}>+212 522675423</Link>
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <Button asChild variant={"outline"} className="w-fit mx-auto">
                <MapPin />
              </Button>
            </CardHeader>
            <CardContent>
              <CardDescription>Somewhere in Morocco</CardDescription>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardHeader>
              <div className="flex items-center gap-1">
                <Button asChild variant={"outline"} className="w-fit mx-auto">
                  <Link href={"/"}>
                    <Facebook />
                  </Link>
                </Button>
                <Button asChild variant={"outline"} className="w-fit mx-auto">
                  <Link href={"/"}>
                    <Twitter />
                  </Link>
                </Button>
                <Button asChild variant={"outline"} className="w-fit mx-auto">
                  <Link href={"/"}>
                    <Linkedin />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Social Profiles</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
