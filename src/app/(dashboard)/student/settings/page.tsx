import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import Account from "./_components/account";
import LoginSecurity from "./_components/login-security";
import Notifications from "./_components/notifications";

type Props = {};

const Settings = (props: Props) => {
  return (
    <section className="h-full flex flex-col flex-1">
      <Card className="flex flex-col flex-1">
        <Tabs defaultValue="account" className="flex flex-col flex-1">
          <CardHeader>
            <TabsList className="grid grid-cols-3 ">
              <TabsTrigger value="account">Account Settings</TabsTrigger>
              <TabsTrigger value="login-security">Login Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-hidden">
            <TabsContent value="account" className="h-full">
              <Account />
            </TabsContent>
            <TabsContent value="login-security">
              <LoginSecurity />
            </TabsContent>
            <TabsContent value="notifications">
              <Notifications />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </section>
  );
};

export default Settings;
