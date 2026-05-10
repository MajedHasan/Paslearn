import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal } from "lucide-react";
import React from "react";

type Props = {};

const CourseProgressList = (props: Props) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Complated Course</CardTitle>
        <Popover>
          <PopoverTrigger>
            <MoreHorizontal />
          </PopoverTrigger>
          <PopoverContent className="mr-6"></PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="flex gap-4 flex-col">
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#67686C]">
              Java Code
            </span>
            <span className="text-sm text-[#1C1E24]">75/100</span>
          </div>
          <Progress value={75} className="" />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#67686C]">
              Design Basic
            </span>
            <span className="text-sm text-[#1C1E24]">65/100</span>
          </div>
          <Progress value={65} className="" />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#67686C]">
              Team Building
            </span>
            <span className="text-sm text-[#1C1E24]">30/100</span>
          </div>
          <Progress value={30} className="" />
        </div>
        <div className="w-full">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#67686C]">
              Business Marketing
            </span>
            <span className="text-sm text-[#1C1E24]">20/100</span>
          </div>
          <Progress value={20} className="" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgressList;
