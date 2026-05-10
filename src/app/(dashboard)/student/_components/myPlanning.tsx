import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, MoreVertical, Trash } from "lucide-react";
import Image from "next/image";
import React from "react";

type Props = {};

const MyPlanning = (props: Props) => {
  const planningData = [
    {
      id: 1,
      img: "/img/planning/img-1.png",
      title: "3D Animation Conference",
      date: "December 14, 08:30 PM",
    },
    {
      id: 2,
      img: "/img/planning/img-2.png",
      title: "Handle UX Research",
      date: "December 18, 10:30 PM",
    },
    {
      id: 3,
      img: "/img/planning/img-3.png",
      title: "Machine Learning Lesson",
      date: "December 18, 10:30 PM",
    },
    {
      id: 4,
      img: "/img/planning/img-4.png",
      title: "3D Animation Conference",
      date: "December 22, 10:30 PM",
    },
  ];

  return (
    <Card>
      <CardHeader className="flex items-center sm:flex-row flex-col justify-between gap-4">
        <CardTitle className="text-lg">My Planning </CardTitle>
        <Select>
          <SelectTrigger className="max-w-[130px]">
            <SelectValue placeholder="Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select Date</SelectLabel>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {planningData.map((item) => (
          <Card
            key={item.id}
            className="flex items-center gap-3 justify-between p-3"
          >
            <div className="flex items-center gap-2">
              <Image
                src={item.img}
                alt={item.title}
                width={20}
                height={20}
                className="w-14 h-14 rounded-lg"
              />
              <div>
                <h2 className="text-sm font-semibold">{item.title}</h2>
                <p className="text-xs">{item.date}</p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger>
                <MoreVertical />
              </PopoverTrigger>
              <PopoverContent className="w-40 mr-10">
                <Button
                  variant={"ghost"}
                  className="flex items-center gap-2 justify-between w-full"
                >
                  <span className="text-sm">Edit</span>
                  <Edit />
                </Button>
                <Button
                  variant={"ghost"}
                  className="flex items-center gap-2 justify-between w-full"
                >
                  <span className="text-sm">Delete</span>
                  <Trash />
                </Button>
              </PopoverContent>
            </Popover>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default MyPlanning;
