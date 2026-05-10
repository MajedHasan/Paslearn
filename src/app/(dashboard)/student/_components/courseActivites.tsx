"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {};

const CourseActivites = (props: Props) => {
  const pieChartData = [
    { name: "InProgress", value: 30 },
    { name: "Done", value: 70 },
  ];

  const COLORS = ["transparent", "#0177FB"]; // 30% gray and 70% blue
  // Calculate total value of the data
  const totalValue = pieChartData.reduce((acc, entry) => acc + entry.value, 0);

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="text-lg">Cource Activites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Gray color Pie (centered) */}
              <Pie
                data={[{ value: 100 }]}
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={60} // Set innerRadius to create a smaller gray layer
                fill="#EFF2FF" // 30% gray color
                paddingAngle={0}
                startAngle={0}
                endAngle={360}
                dataKey="value"
              />
              {/* Blue color Pie with border radius (outer layer) */}
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40} // Set innerRadius to create the Donut effect
                fill="#0177FB" // 70% blue color
                paddingAngle={0}
                dataKey="value"
                cornerRadius={10} // Set cornerRadius to create a border radius effect
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
              <svg>
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#000"
                  fontSize="16"
                >
                  {((totalValue / 1000) * 100).toFixed(1)}%
                </text>
              </svg>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseActivites;
