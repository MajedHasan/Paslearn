"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { registerUser, clearError } from "@/store/slices/userSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, FormEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, success } = useAppSelector((state) => state.user);

  // local visible state to nicely show/hide banners
  const [visibleError, setVisibleError] = useState<string | null>(null);
  const [visibleSuccess, setVisibleSuccess] = useState<string | null>(null);

  useEffect(() => {
    setVisibleError(error || null);
    if (error) {
      const t = setTimeout(() => setVisibleError(null), 6000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    setVisibleSuccess(success || null);
    if (success) {
      const t = setTimeout(() => setVisibleSuccess(null), 5000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // optional redirect to sign-in after successful register
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => {
        router.push("/auth/sign-in");
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [success, router]);

  const formSchema = z
    .object({
      full_name: z
        .string()
        .min(2, { message: "Full Name must be at least 2 characters" })
        .max(50, { message: "Full Name must be maximum 50 characters" }),
      email: z
        .string()
        .email({ message: "Please enter a valid email address" })
        .min(2, { message: "Email must be at least 2 characters" })
        .max(50, { message: "Email must be maximum 50 characters" }),
      password: z
        .string()
        .min(4, { message: "Password must be at least 4 characters" })
        .max(30, { message: "Password must be maximum 30 characters" }),
      TOS: z.boolean(),
    })
    .refine((data) => data.TOS, {
      path: ["TOS"],
      message: "You must accept the Terms of Service to proceed.",
    });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      TOS: true,
    },
  });

  const onSubmit = (values: FormValues) => {
    dispatch(
      registerUser({
        method: "email",
        email: values.email,
        password: values.password,
        name: values.full_name,
      })
    );
  };

  // prevent page reload and run react-hook-form validations
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e as any);
  };

  // Google sign up
  const handleGoogleSignup = () => {
    dispatch(registerUser({ method: "google" }));
  };

  // Clear errors/success when user interacts
  const handleChange = () => {
    if (visibleError) setVisibleError(null);
    if (visibleSuccess) setVisibleSuccess(null);
    dispatch(clearError());
  };

  return (
    <Card className="max-w-md w-full lg:ms-auto ">
      <CardHeader className="text-center">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account to unlock exclusive features.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success banner */}
        {visibleSuccess && (
          <div
            role="status"
            className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex justify-between items-start gap-3"
          >
            <div>
              <strong className="block">Success</strong>
              <div>{visibleSuccess}</div>
            </div>
            <button
              onClick={() => {
                setVisibleSuccess(null);
                dispatch(clearError());
              }}
              aria-label="Dismiss success"
              className="ml-3 text-green-700 underline"
            >
              Close
            </button>
          </div>
        )}

        {/* Error banner */}
        {visibleError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex justify-between items-start gap-3"
          >
            <div>
              <strong className="block">Error</strong>
              <div>{visibleError}</div>
            </div>
            <button
              onClick={() => {
                setVisibleError(null);
                dispatch(clearError());
              }}
              aria-label="Dismiss error"
              className="ml-3 text-red-700 underline"
            >
              Close
            </button>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={handleFormSubmit}
            className="space-y-8"
            onChange={handleChange}
            noValidate
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Name" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Email" {...field} />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your Password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="TOS"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormLabel
                      htmlFor="checkbox"
                      className="flex items-center justify-start gap-3"
                    >
                      <Checkbox
                        id="checkbox"
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                      <p className="font-thin">
                        I agree with{" "}
                        <Link
                          href={"/"}
                          className="underline font-medium italic"
                        >
                          Terms of Use
                        </Link>{" "}
                        and{" "}
                        <Link
                          href={"/"}
                          className="underline font-medium italic"
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    </FormLabel>
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Create account"}
            </Button>
          </form>
        </Form>

        <div className="flex items-center justify-between gap-2 mt-6 mb-4">
          <Separator className="flex-1" />
          <span>OR</span>
          <Separator className="flex-1" />
        </div>

        <div className="text-center">
          <Button
            className="flex items-center gap-3 mx-auto"
            variant={"outline"}
            onClick={handleGoogleSignup}
            disabled={loading}
            aria-label="Sign up with Google"
          >
            <Avatar className="w-full h-full max-w-[25px]">
              <AvatarImage src="/img/google-icon.png" alt="Google Icon" />
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <span>Sign Up with Google</span>
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-center w-full">
          Already have an account?{" "}
          <Link href={"/auth/sign-in"} className="font-bold underline italic">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Page;
