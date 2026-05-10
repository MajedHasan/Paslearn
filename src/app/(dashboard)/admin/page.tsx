"use client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {};

const Dashboard = (props: Props) => {
  const barChartData = [
    { name: "Jan", freeMember: 400, paidMember: 250 },
    { name: "Feb", freeMember: 300, paidMember: 100 },
    { name: "Mar", freeMember: 300, paidMember: 50 },
    { name: "Apr", freeMember: 200, paidMember: 220 },
    { name: "May", freeMember: 278, paidMember: 120 },
    { name: "Jun", freeMember: 189, paidMember: 150 },
    { name: "Jul", freeMember: 189, paidMember: 170 },
    { name: "Aug", freeMember: 189, paidMember: 70 },
    { name: "Sep", freeMember: 189, paidMember: 80 },
    { name: "Oct", freeMember: 189, paidMember: 90 },
    { name: "Nov", freeMember: 189, paidMember: 30 },
    { name: "Dec", freeMember: 189, paidMember: 50 },
  ];

  const pieChartData = [
    { name: "Free", value: 100, color: "#FCD2C2" },
    { name: "Paid", value: 800, color: "#EB5017" },
    { name: "Unsubscribe", value: 200, color: "#FCB59A" },
  ];

  const [isMounted, setIsMounded] = useState(true);

  useEffect(() => {
    setIsMounded(false);
  }, [isMounted]);

  if (isMounted) return;

  return (
    <section className="py-2">
      <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7">
        <Card>
          <CardHeader className="flex items-center flex-row justify-between">
            <CardTitle className="text-sm font-normal">
              Active Subscribers
            </CardTitle>
            <Select>
              <SelectTrigger className="w-[120px] outline-none">
                <SelectValue placeholder="This week" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-month">3 Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold">14,295</span>
            <div className="flex gap-2 items-center">
              <Badge className="bg-[#E7F6EC] text-[#036B26]">
                <ArrowUp size={10} /> 15%
              </Badge>
              <span className="text-xs text-[#7A7A9D]">from 14,000</span>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex items-center flex-row justify-between">
            <CardTitle className="text-sm font-normal">
              Avg. Open Rate
            </CardTitle>
            <Select>
              <SelectTrigger className="w-[120px] outline-none">
                <SelectValue placeholder="This week" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-month">3 Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold">66.7%</span>
            <div className="flex gap-2 items-center">
              <Badge className="bg-[#FBEAE9] text-[#9E0A05]">
                <ArrowDown size={10} /> 5%
              </Badge>
              <span className="text-xs text-[#7A7A9D]">from 69.00%</span>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex items-center flex-row justify-between">
            <CardTitle className="text-sm font-normal">
              Avg. Click Rate
            </CardTitle>
            <Select>
              <SelectTrigger className="w-[120px] outline-none">
                <SelectValue placeholder="This week" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-month">3 Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold">89.1%</span>
            <div className="flex gap-2 items-center">
              <Badge className="bg-[#FBEAE9] text-[#9E0A05]">
                <ArrowDown size={10} /> 8%
              </Badge>
              <span className="text-xs text-[#7A7A9D]">from 93.00%</span>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="flex items-center flex-row justify-between">
            <CardTitle className="text-sm font-normal">Total Emails</CardTitle>
            <Select>
              <SelectTrigger className="w-[120px] outline-none">
                <SelectValue placeholder="This week" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-month">3 Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardFooter className="flex items-center justify-between gap-3">
            <span className="text-lg font-bold">807</span>
            <div className="flex gap-2 items-center">
              <Badge className="bg-[#E7F6EC] text-[#036B26]">
                <ArrowUp size={10} /> 10%
              </Badge>
              <span className="text-xs text-[#7A7A9D]">from 700</span>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="flex gap-5 mt-5 xl:flex-row flex-col-reverse">
        <Card className="flex-[3]">
          <CardHeader className="flex items-start gap-3 justify-between flex-row">
            <div>
              <span className="text-sm text-[#475367]">Email Sent</span>
              <CardTitle className="my-2">100,045</CardTitle>
              <span className="text-sm text-[#98A2B3]">Total emails</span>
            </div>
            <Select>
              <SelectTrigger className="w-[180px] outline-none">
                <Calendar />
                <SelectValue placeholder="This week" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Date</SelectLabel>
                  <SelectItem value="this-week">This week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="3-month">3 Month</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end gap-4">
              <div className="flex items-center gap-1">
                <span className="block w-2 h-2 rounded-full bg-themeAdminPrimary"></span>
                <span className="text-sm">Free Members</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="block w-2 h-2 rounded-full bg-[#F56630]"></span>
                <span className="text-sm">Paid Members</span>
              </div>
            </div>
            <Separator />
          </CardContent>
          <CardFooter>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="5 5" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="paidMember" fill="#EB5017" stackId="stack" />
                  <Bar dataKey="freeMember" fill="#F77A4A" stackId="stack" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-sm font-normal">
              Subscribers Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-[#FCD2C2]"></span>
                <span className="text-sm text-[#667185]">Free</span>
              </div>
              <span className="text-sm">100k</span>
            </div>
            <div className="flex items-center justify-between gap-2 my-2">
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-themeAdminPrimary"></span>
                <span className="text-sm text-[#667185]">Paid</span>
              </div>
              <span className="text-sm">800k</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="block w-2 h-2 rounded-full bg-[#FCB59A]"></span>
                <span className="text-sm text-[#667185]">Unsubscribers</span>
              </div>
              <span className="text-sm">200k</span>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
