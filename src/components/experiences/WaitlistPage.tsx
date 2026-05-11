"use client";

import * as React from "react";
import axios from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  GraduationCap,
  BriefcaseBusiness,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const waitlistSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name"),
    whatsapp: z
      .string()
      .trim()
      .min(6, "Please enter a valid WhatsApp number")
      .max(20, "Please enter a valid WhatsApp number")
      .regex(/^[+()\d\s-]+$/, "Please enter a valid WhatsApp number"),
    email: z.string().trim().email("Please enter a valid email"),
    role: z.enum(["teacher", "student", "other"]),
    specify: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.role === "other" && !values.specify?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specify"],
        message: "Please specify",
      });
    }
  });

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

const defaultValues: WaitlistFormValues = {
  fullName: "",
  whatsapp: "",
  email: "",
  role: "student",
  specify: "",
};

const valueProps = [
  {
    icon: CheckCircle2,
    text: "Where you can sell your knowledge",
  },
  {
    icon: GraduationCap,
    text: "Where you can learn, earn & connect with companies",
  },
  {
    icon: BriefcaseBusiness,
    text: "Where companies can find right people for there needs",
  },
];

export default function WaitlistPage({
  config,
}: {
  config?: Record<string, any>;
}) {
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues,
    mode: "onTouched",
  });

  const role = form.watch("role");

  React.useEffect(() => {
    if (role !== "other" && form.getValues("specify")) {
      form.setValue("specify", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [role, form]);

  const onSubmit = async (values: WaitlistFormValues) => {
    try {
      const payload = {
        fullName: values.fullName.trim(),
        whatsapp: values.whatsapp.trim(),
        email: values.email.trim(),
        role: values.role,
        specify: values.role === "other" ? (values.specify?.trim() ?? "") : "",
      };

      await api.post("/waitlist", payload);

      toast.success("You are in. Welcome to the Paslearn waitlist.");
      form.reset(defaultValues);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string })?.message ||
          "Something went wrong. Please try again."
        : "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-slate-50">
      {/* Living background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/70 via-slate-50/40 to-slate-100/80" />

      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#D4A017]/12 blur-3xl" />
      <div className="pointer-events-none absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#D4A017]/8 blur-3xl" />

      {/* Main glass frame */}
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative w-full overflow-hidden rounded-[2.25rem] border border-[#D4A017]/20 bg-white/70 shadow-[0_30px_120px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
          <div className="grid lg:grid-cols-2">
            {/* Left / Hook */}
            <section className="relative border-b border-slate-200/70 px-6 py-10 sm:px-8 sm:py-12 lg:border-b-0 lg:border-r lg:px-12 lg:py-16">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-white/60 px-4 py-2 text-sm font-semibold tracking-wide text-slate-900 shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#D4A017]" />
                  Paslearn
                </div>

                <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  {config?.title || "Wait List for Paslearn"}
                </h1>

                <p className="mt-4 max-w-lg text-base font-medium leading-7 text-slate-600 sm:text-lg">
                  {config?.description ||
                    "Join 5,000+ experts and students already in the queue."}
                </p>

                <div className="mt-8 space-y-5">
                  {valueProps.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#D4A017]/15 bg-white/70 shadow-sm">
                        <Icon className="h-5 w-5 text-[#D4A017]" />
                      </div>
                      <p className="max-w-md pt-1 text-[1.02rem] font-medium leading-7 tracking-tight text-slate-800">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-3xl border border-white/60 bg-white/55 p-5 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Exclusive access
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Be first in line for the launch, early product drops, and
                    the smartest people in your space.
                  </p>
                </div>
              </div>
            </section>

            {/* Right / Action */}
            <section className="px-6 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
              <div className="mx-auto max-w-xl">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Request access
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Get on the early list
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
                    Tell us who you are and we will reserve your spot.
                  </p>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">
                            Full name
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              autoComplete="name"
                              placeholder="Your full name"
                              className="h-12 rounded-2xl border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-[#D4A017]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">
                            Whatsapp
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="+8801XXXXXXXXX"
                              className="h-12 rounded-2xl border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-[#D4A017]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              autoComplete="email"
                              placeholder="name@company.com"
                              className="h-12 rounded-2xl border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-[#D4A017]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">
                            Are you:
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white/85 text-slate-900 shadow-sm focus:ring-[#D4A017]">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="other">
                                Other (specify)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        role === "other"
                          ? "max-h-28 translate-y-0 opacity-100"
                          : "max-h-0 -translate-y-2 opacity-0"
                      }`}
                    >
                      <div className="pt-1">
                        <FormField
                          control={form.control}
                          name="specify"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700">
                                Please specify
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Tell us more"
                                  className="h-12 rounded-2xl border-slate-200 bg-white/85 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-[#D4A017]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="group relative h-14 w-full overflow-hidden rounded-2xl bg-[#D4A017] px-6 text-base font-bold text-white shadow-[0_18px_40px_rgba(212,160,23,0.28)] transition-transform duration-200 hover:scale-[1.01] hover:bg-[#bf910f] focus-visible:ring-[#D4A017]"
                    >
                      <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.35)_35%,transparent_50%)] translate-x-[-120%] transition-transform duration-700 group-hover:translate-x-[120%]" />
                      <span className="relative inline-flex items-center gap-2">
                        {form.formState.isSubmitting
                          ? "Submitting..."
                          : config?.buttonText || "Join the Waitlist"}
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Button>
                  </form>
                </Form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
