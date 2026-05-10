import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

type Props = {};

const Dashboard = (props: Props) => {
  return (
    <section>
      <div className="flex gap-5 xl:flex-row flex-col">
        <Card className="flex-[3]">
          <CardHeader>
            <CardTitle>Recent Courses Results</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
        <div className="flex-1">
          <Card className="shadow bg-[#E9F0EF]">
            <CardHeader>
              <CardTitle>Create</CardTitle>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter>
              <Button
                className="bg-themeTeacherPrimary w-full rounded-full shadow-xl"
                asChild
              >
                <Link href={"/courses"}>Create Test</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
