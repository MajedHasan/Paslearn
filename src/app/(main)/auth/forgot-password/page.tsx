"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/hooks/useRedux";
import { clearError } from "@/store/slices/userSlice";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  sendResetPassword,
  verifyResetCode,
  confirmResetPassword,
  signinAndGetIdToken,
} from "@/lib/firebaseAuth";

type Props = {
  searchParams: {
    token?: string; // firebase uses 'oobCode' by default, but your router may map it to token
  };
};

const Page = ({ searchParams }: Props) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [visibleError, setVisibleError] = useState<string | null>(null);
  const [visibleSuccess, setVisibleSuccess] = useState<string | null>(null);
  const [emailFromCode, setEmailFromCode] = useState<string | null>(null);

  // prefer oobCode param name if Firebase sends that; accept token too
  const oobCode = searchParams.token || (searchParams as any).oobCode || null;

  // If we have an oobCode, attempt to verify it on mount to extract email
  useEffect(() => {
    let cancelled = false;
    if (!oobCode) return;

    setLoading(true);
    verifyResetCode(oobCode)
      .then((email) => {
        if (!cancelled) {
          setEmailFromCode(email);
          setVisibleError(null);
        }
      })
      .catch((err) => {
        console.error("verifyResetCode error:", err);
        setVisibleError(
          "Invalid or expired reset link. Please request a new reset."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [oobCode]);

  // forms
  const emailSchema = z.object({
    email: z.string().email("Please enter a valid email"),
  });
  const passwordSchema = z
    .object({
      password: z.string().min(6, "Password must be at least 6 characters"),
      confirm: z.string().min(6, "Confirm password is required"),
    })
    .refine((val) => val.password === val.confirm, {
      message: "Passwords do not match",
      path: ["confirm"],
    });

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  // Request password reset (sends Firebase email)
  const handleRequestReset = async (values: { email: string }) => {
    setVisibleError(null);
    setVisibleSuccess(null);
    setLoading(true);
    try {
      await sendResetPassword(values.email);
      setVisibleSuccess(
        "Password reset email sent. Check your inbox (and spam)."
      );
      emailForm.reset();
      dispatch(clearError());
    } catch (err: any) {
      console.error("sendResetPassword error:", err);
      setVisibleError(
        err?.message || "Unable to send reset email. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Confirm new password (oobCode present)
  const handleSetNewPassword = async (values: {
    password: string;
    confirm: string;
  }) => {
    if (!oobCode) {
      setVisibleError(
        "Missing reset code. Please use the link from your email."
      );
      return;
    }

    setVisibleError(null);
    setVisibleSuccess(null);
    setLoading(true);

    try {
      // 1) Confirm with Firebase
      await confirmResetPassword(oobCode, values.password);

      // 2) Optional: sign in to get email & idToken (verify user)
      // verifyResetCode already provided email; if not available, call verifyResetCode again
      let email = emailFromCode;
      if (!email) {
        email = await verifyResetCode(oobCode);
      }

      // If you want to sync backend password (recommended),
      // sign in with Firebase to get idToken then call backend sync endpoint:
      // (backend endpoint must verify idToken and update stored hashed password)
      try {
        // Sign in to get idToken (Firebase)
        const { idToken } = await signinAndGetIdToken(email!, values.password);

        // Call backend to sync password (you need to implement this endpoint — snippet below)
        // It's safer if backend verifies the idToken using Firebase Admin and then updates the hashed password.
        await api.post("/auth/firebase-reset-sync", {
          idToken,
          newPassword: values.password,
        });

        // After successful sync, inform user and redirect to sign-in
        setVisibleSuccess(
          "Password updated successfully. Redirecting to sign-in..."
        );
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 1800);
      } catch (syncErr: any) {
        // If backend sync fails, still inform the user that Firebase password changed.
        console.warn("Backend sync failed:", syncErr);
        setVisibleSuccess(
          "Password updated via Firebase. Please sign in with your new password."
        );
        setTimeout(() => {
          router.push("/auth/sign-in");
        }, 1800);
      }
    } catch (err: any) {
      console.error("confirmResetPassword error:", err);
      setVisibleError(
        err?.message || "Failed to reset password. The link may be expired."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit =
    (fn: (...args: any[]) => void, getValues: () => any) => (e: FormEvent) => {
      e.preventDefault();
      fn(getValues());
    };

  const handleChange = () => {
    setVisibleError(null);
    setVisibleSuccess(null);
    dispatch(clearError());
  };

  return (
    <Card className="max-w-md w-full lg:ms-auto">
      <CardHeader className="text-center">
        <CardTitle>
          {oobCode ? "Set a new password" : "Forgot Password"}
        </CardTitle>
        <CardDescription>
          {oobCode
            ? "Enter a new password for your account."
            : "Enter your email to receive a password reset link."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success */}
        {visibleSuccess && (
          <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800 flex justify-between items-start gap-3">
            <div>
              <strong className="block">Success</strong>
              <div>{visibleSuccess}</div>
            </div>
            <button
              onClick={() => setVisibleSuccess(null)}
              className="ml-3 text-green-700 underline"
            >
              Close
            </button>
          </div>
        )}

        {/* Error */}
        {visibleError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 flex justify-between items-start gap-3">
            <div>
              <strong className="block">Error</strong>
              <div>{visibleError}</div>
            </div>
            <button
              onClick={() => setVisibleError(null)}
              className="ml-3 text-red-700 underline"
            >
              Close
            </button>
          </div>
        )}

        {oobCode ? (
          <Form {...passwordForm}>
            <form
              onSubmit={handleFormSubmit(
                () => passwordForm.handleSubmit(handleSetNewPassword)(),
                passwordForm.getValues
              )}
              className="space-y-8"
              onChange={handleChange}
              noValidate
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting..." : "Set New Password"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...emailForm}>
            <form
              onSubmit={handleFormSubmit(
                () => emailForm.handleSubmit(handleRequestReset)(),
                emailForm.getValues
              )}
              className="space-y-8"
              onChange={handleChange}
              noValidate
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Send reset email"}
              </Button>
            </form>
          </Form>
        )}
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
