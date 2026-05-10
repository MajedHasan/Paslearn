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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { loginUser, clearError } from "@/store/slices/userSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Page = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, success, redirectPath } = useAppSelector(
    (state) => state.user
  );

  // local visible state so we can auto-hide the banners nicely
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

  // Redirect based on role after login
  useEffect(() => {
    if (redirectPath) {
      router.push(redirectPath);
    }
  }, [redirectPath, router]);

  const formSchema = z.object({
    email: z.string().min(2).max(50).email(),
    password: z.string().min(4).max(30),
    remember: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // dispatch email login with method flag
    dispatch(
      loginUser({
        method: "email",
        email: values.email,
        password: values.password,
      })
    );
  };

  // explicit wrapper to prevent default (fix page reload)
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    // run react-hook-form validation + our onSubmit
    form.handleSubmit(onSubmit)(e as any);
  };

  const handleGoogleLogin = () => {
    dispatch(loginUser({ method: "google" }));
  };

  // Clear errors when user types (keeps your behavior) and clear local banners
  const handleChange = () => {
    if (visibleError) setVisibleError(null);
    if (visibleSuccess) setVisibleSuccess(null);
    dispatch(clearError());
  };

  return (
    <Card className="max-w-md w-full lg:ms-auto">
      <CardHeader className="text-center">
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Welcome back! Please log in to access your account.
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your Email" {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                href="/auth/forgot-password"
                className="text-sm italic underline"
              >
                Forgot Password?
              </Link>
            </div>

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-3">
                    <Checkbox
                      id="checkbox"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                    Remember Me
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Login"}
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
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={loading}
            aria-label="Login with Google"
          >
            <Avatar className="w-full h-full max-w-[25px]">
              <AvatarImage src="/img/google-icon.png" alt="Google Icon" />
              <AvatarFallback>G</AvatarFallback>
            </Avatar>
            <span>Login with Google</span>
          </Button>
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-center w-full">
          Don’t have an account?{" "}
          <Link href="/auth/sign-up" className="font-bold underline italic">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default Page;
