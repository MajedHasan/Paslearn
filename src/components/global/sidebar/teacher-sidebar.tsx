import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherSidebarItems } from "@/lib/constants";
import { BookText, CircleHelp, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

type Props = {};

const TeacherSidebar = (props: Props) => {
  return (
    <aside className="flex flex-col gap-5 justify-between h-full p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 pl-4">
          <Star />
          <span className="text-lg font-bold text-slate-900">Paslearn</span>
        </div>
        <div className="flex flex-1 overflow-hiden max-h-full">
          <div className="flex flex-col overflow-scroll flex-1">
            {TeacherSidebarItems.map((item) => (
              <Link
                key={item.name}
                href={`/teacher${item.url}`}
                className="w-full py-3 hover:bg-themeTeacherPrimary transition-all rounded-lg pl-4 group flex items-center gap-3 "
              >
                {
                  <item.icon
                    size={20}
                    className="text-themeTeacherPrimary group-hover:text-slate-50"
                  />
                }
                <span className="text-sm text-[#A0AEC0] group-hover:text-slate-50 group-hover:font-bold">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 pb-4">
        <Card className="bg-themeTeacherPrimary">
          <CardHeader>
            <div className="bg-slate-50 rounded-xl p-2 w-fit">
              <CircleHelp className="bg-themeTeacherPrimary rounded-xl text-slate-50" />
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg text-slate-50">Need Help?</CardTitle>
            <CardDescription className="text-slate-50">
              Please check our docs
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={"/docs"} className="flex items-center gap-2">
                <BookText size={20} />
                <span>CHECK</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
