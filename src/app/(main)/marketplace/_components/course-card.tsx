"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Clock, BookOpen, Play, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnailMediaId?: string | { url?: string };
  priceModel: "free" | "onetime" | "subscription";
  oneTimePricing?: {
    price: number;
    currency: string;
    discountPercent?: number;
  };
  subscriptionTiers?: {
    id: string;
    interval: "weekly" | "monthly" | "yearly";
    price: number;
    discountPercent?: number;
    isActive: boolean;
  }[];
  students?: number;
  rating?: number;
  lessonsCount?: number;
  teacher?: { name: string };
  createdAt: string;
  category?: string;
}

interface CourseCardProps {
  course: Course;
  getThumbnailUrl: (course: Course) => string;
  getPriceDisplay: (course: Course) => string;
}

export default function CourseCard({
  course,
  getThumbnailUrl,
  getPriceDisplay,
}: CourseCardProps) {
  const thumbnailUrl = getThumbnailUrl(course);
  const priceDisplay = getPriceDisplay(course);

  return (
    <Link href={`/marketplace/${course._id}`} className="block">
      <Card className="group overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Price badge */}
          <div className="absolute top-4 right-4">
            {course.priceModel === "free" ? (
              <Badge className="bg-green-500 text-white shadow-lg">Free</Badge>
            ) : course.priceModel === "subscription" ? (
              <Badge className="bg-indigo-500 text-white shadow-lg">Subscription</Badge>
            ) : (
              <Badge className="bg-white/90 text-slate-900 shadow-lg backdrop-blur-sm">
                {priceDisplay}
              </Badge>
            )}
          </div>

          {/* Category */}
          {course.category && (
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="border-white/30 bg-white/20 text-white backdrop-blur-md">
                {course.category}
              </Badge>
            </div>
          )}

          {/* Quick preview button on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button className="rounded-full bg-white text-slate-900 shadow-xl hover:bg-slate-100">
              <Play className="mr-2 h-4 w-4" /> Preview
            </Button>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="line-clamp-2 font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
            {course.title}
          </h3>

          {course.teacher?.name && (
            <p className="mt-1 text-sm text-slate-500">By {course.teacher.name}</p>
          )}

          <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{course.rating?.toFixed(1) || "0.0"}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.lessonsCount || 0} lessons
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-lg font-extrabold text-slate-900">{priceDisplay}</span>
            <span className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(course.createdAt))} ago
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}