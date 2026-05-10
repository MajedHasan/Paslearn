import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderDot, ImageDown } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

const Settings = (props: Props) => {
  return (
    <section>
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="student">Student</TabsTrigger>
          <TabsTrigger value="teacher">Teacher</TabsTrigger>
          <TabsTrigger
            value="administrator"
            className="flex items-center gap-2 data-[state=active]:text-themeAdminPrimary"
          >
            <FolderDot />
            <span>Administrator</span>
          </TabsTrigger>
          <TabsTrigger
            value="experience"
            className="flex items-center gap-2 data-[state=active]:text-themeAdminPrimary"
          >
            <ImageDown />
            Experience
          </TabsTrigger>
        </TabsList>
        <Separator />
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student</CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="teacher">
          <Card>
            <CardHeader>
              <CardTitle>Teacher</CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="administrator">
          <Card>
            <CardHeader>
              {/* <HomeIcon className="text-themeAdminPrimary" /> */}
              <FolderDot />
              <CardTitle>Administrator</CardTitle>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <ImageDown />
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                className="border border-slate-100 flex gap-2 bg-themeAdminPrimary text-white"
              >
                <Link href={"/admin/experiences"}>
                  <ImageDown size={15} />
                  <span>Manage Experiences</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Settings;
