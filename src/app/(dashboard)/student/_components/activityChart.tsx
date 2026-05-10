"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {};

const ActivityChart = (props: Props) => {
  const lineChartWeekData = [
    { date: "10 Oct", value: 10, value2: 8, amt: 10 },
    { date: "11 Oct", value: 14, value2: 15, amt: 20 },
    { date: "12 Oct", value: 20, value2: 30, amt: 30 },
    { date: "13 Oct", value: 40, value2: 45, amt: 40 },
    { date: "14 Oct", value: 48, value2: 60, amt: 50 },
    { date: "15 Oct", value: 55, value2: 25, amt: 60 },
    { date: "16 Oct", value: 45, value2: 32, amt: 70 },
  ];
  const lineChartMonthData = [
    { date: "01 Jan", value: 10, value2: 8, amt: 10 },
    { date: "02 Jan", value: 14, value2: 15, amt: 20 },
    { date: "03 Jan", value: 24, value2: 15, amt: 20 },
    { date: "04 Jan", value: 34, value2: 15, amt: 20 },
    { date: "05 Jan", value: 44, value2: 15, amt: 20 },
    { date: "06 Jan", value: 54, value2: 15, amt: 20 },
    { date: "07 Jan", value: 64, value2: 15, amt: 20 },
    { date: "08 Jan", value: 74, value2: 15, amt: 20 },
    { date: "09 Jan", value: 84, value2: 15, amt: 20 },
    { date: "10 Jan", value: 94, value2: 15, amt: 20 },
    { date: "11 Jan", value: 114, value2: 15, amt: 20 },
    { date: "12 Jan", value: 124, value2: 15, amt: 20 },
    { date: "13 Jan", value: 20, value2: 15, amt: 20 },
    { date: "14 Jan", value: 35, value2: 15, amt: 20 },
    { date: "15 Jan", value: 34, value2: 15, amt: 20 },
    { date: "16 Jan", value: 55, value2: 15, amt: 20 },
    { date: "17 Jan", value: 30, value2: 15, amt: 20 },
    { date: "18 Jan", value: 20, value2: 15, amt: 20 },
    { date: "19 Jan", value: 10, value2: 15, amt: 20 },
    { date: "20 Jan", value: 50, value2: 15, amt: 20 },
    { date: "21 Jan", value: 60, value2: 15, amt: 20 },
    { date: "22 Jan", value: 80, value2: 15, amt: 20 },
    { date: "23 Jan", value: 30, value2: 15, amt: 20 },
    { date: "24 Jan", value: 40, value2: 15, amt: 20 },
    { date: "25 Jan", value: 20, value2: 15, amt: 20 },
    { date: "26 Jan", value: 75, value2: 15, amt: 20 },
    { date: "27 Jan", value: 90, value2: 15, amt: 20 },
    { date: "28 Jan", value: 100, value2: 15, amt: 20 },
    { date: "29 Jan", value: 50, value2: 15, amt: 20 },
    { date: "30 Jan", value: 10, value2: 15, amt: 20 },
  ];
  const lineChartYearData = [
    { date: "Jan", value: 10, value2: 8, amt: 10 },
    { date: "Feb", value: 14, value2: 15, amt: 20 },
    { date: "Mar", value: 20, value2: 30, amt: 30 },
    { date: "Apr", value: 40, value2: 45, amt: 40 },
    { date: "May", value: 48, value2: 60, amt: 50 },
    { date: "Jun", value: 55, value2: 25, amt: 60 },
    { date: "Jul", value: 45, value2: 32, amt: 70 },
    { date: "Aug", value: 45, value2: 32, amt: 70 },
    { date: "Sep", value: 45, value2: 32, amt: 70 },
    { date: "Oct", value: 45, value2: 32, amt: 70 },
    { date: "Nov", value: 45, value2: 32, amt: 70 },
    { date: "Dec", value: 45, value2: 32, amt: 70 },
  ];

  const [isMounted, setIsMounted] = useState(true);
  const [activityDate, setActivityDate] = useState("week");

  useEffect(() => {
    setIsMounted(false);
  }, []);

  useEffect(() => {
    console.log(activityDate);
  }, [activityDate]);

  if (isMounted) return;

  return (
    <Card>
      <CardHeader className="flex items-center gap-4 justify-between md:flex-row flex-col">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Activities</CardTitle>
          <div className="flex items-center gap-1">
            <Badge className="p-0 w-2 h-2 rounded-full bg-themeAdminPrimary" />
            <span className="text-xs">Theory</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="p-0 w-2 h-2 rounded-full bg-themeStudentPrimary" />
            <span className="text-xs">Practice</span>
          </div>
        </div>
        <Select onValueChange={(e) => setActivityDate(e)}>
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
      <CardContent>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={
                activityDate === "week"
                  ? lineChartWeekData
                  : activityDate === "month"
                  ? lineChartMonthData
                  : lineChartYearData
              }
              width={500}
              height={300}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0177FB"
                activeDot={{ r: 8 }}
                strokeWidth={4}
              />
              <Line
                type="monotone"
                dataKey="value2"
                stroke="#FF7E02"
                strokeWidth={4}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
