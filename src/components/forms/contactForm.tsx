"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { MailPlus } from "lucide-react";

const formSchema = z.object({
  fullname: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  email: z.string().min(1, {
    message: "Email cant be empty",
  }),
  phone: z.string().min(1, {
    message: "Phone cant be empty",
  }),
  subject: z.string().min(1, {
    message: "Subject cant be empty",
  }),
  message: z.string().min(1, {
    message: "Message cant be empty",
  }),
});

type Props = {};

const ContactForm = (props: Props) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    // Thank You Popup
    setDialogOpen(true);

    setTimeout(() => {
      setDialogOpen(false);
    }, 2000);
  }

  return (
    <>
      <section className="col-span-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 grid lg:grid-cols-2 grid-cols-1 gap-10"
          >
            <div className="lg:col-span-2 col-span-1">
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
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
            </div>
            <div>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="lg:col-span-2 col-span-1">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your Subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="lg:col-span-2 col-span-1">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your Message here..."
                        {...field}
                      ></Textarea>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="lg:col-span-2 col-span-1 mx-auto">
              <Button type="submit" className="bg-themePrimary">
                Send Your Message
              </Button>
            </div>
          </form>
          <Dialog
            open={dialogOpen}
            onOpenChange={(isOpen) => setDialogOpen(isOpen)}
          >
            {/* <DialogTrigger asChild>
              <Button variant="outline">Edit Profile</Button>
            </DialogTrigger> */}
            <DialogContent>
              <DialogHeader className="!text-center w-full">
                <MailPlus className="w-40 mx-auto text-5xl" />
                <DialogTitle>Thank You</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </Form>
      </section>
    </>
  );
};

export default ContactForm;
