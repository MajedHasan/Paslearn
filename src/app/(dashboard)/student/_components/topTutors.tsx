import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";

type Props = {};

const TopTutors = (props: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Tutors</CardTitle>
        <CardDescription>Add they to list</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 grid-cols-1 gap-5">
        <Card className="flex items-center justify-between gap-5 p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/img/testimonial-img-1.png" alt="Profile Pic" />
              <AvatarFallback>Pic</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md">Anna Karlos</CardTitle>
              <CardDescription className="text-xs">Programming</CardDescription>
            </div>
          </div>
          <Button className="rounded-full" variant={"secondary"}>
            <Plus />
          </Button>
        </Card>
        <Card className="flex items-center justify-between gap-5 p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/img/testimonial-img-1.png" alt="Profile Pic" />
              <AvatarFallback>Pic</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md">Bill Jesson</CardTitle>
              <CardDescription className="text-xs">Design</CardDescription>
            </div>
          </div>
          <Button className="rounded-full" variant={"secondary"}>
            <Plus />
          </Button>
        </Card>
        <Card className="flex items-center justify-between gap-5 p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/img/testimonial-img-1.png" alt="Profile Pic" />
              <AvatarFallback>Pic</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md">Karla May</CardTitle>
              <CardDescription className="text-xs">Maths</CardDescription>
            </div>
          </div>
          <Button className="rounded-full" variant={"secondary"}>
            <Plus />
          </Button>
        </Card>
        <Card className="flex items-center justify-between gap-5 p-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/img/testimonial-img-1.png" alt="Profile Pic" />
              <AvatarFallback>Pic</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md">Alan Baker</CardTitle>
              <CardDescription className="text-xs">Physics</CardDescription>
            </div>
          </div>
          <Button className="rounded-full" variant={"secondary"}>
            <Plus />
          </Button>
        </Card>
      </CardContent>
    </Card>
  );
};

export default TopTutors;
