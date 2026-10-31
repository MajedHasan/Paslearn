"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { WelcomeBar } from "./_components/welcome-bar";
import { QuickStats } from "./_components/quick-stats";
import { ActivityChart, ActivityPoint } from "./_components/activityChart";
import { Statistics } from "./_components/statistics";
import { CourseActivities, StatusCounts } from "./_components/courseActivites";
import { CourseProgressList, ProgressCourse } from "./_components/courseProgressList";
import { ContinueLearning, ContinueCourse } from "./_components/myPlanning";
import { TopTutors, TutorItem } from "./_components/topTutors";
import { WeeklyGoal } from "./_components/weeklyGoal";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
const WEEKLY_GOAL = 5;

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    thumbnailUrl?: string;         // ⭐ changed from thumbnailMediaId
    lessonsCount?: number;
    totalDurationSec?: number;
    ratingAvg?: number;
    ratingCount?: number;
    category?: string;
    certificateEnabled?: boolean;
    teacher?: { _id: string; name: string; profileImageUrl?: string };
  };
  progressPercent: number;
  lessonsCompleted: number;
  status: string;
  enrolledAt: string;
  lastAccessedAt?: string;
  completedAt?: string;
  nextLesson?: {
    sectionId: string;
    lessonId: string;
    title: string;
    type: string;
  } | null;
}

interface Certificate {
  _id: string;
}

interface User {
  name?: string;
  email?: string;
}

function thumbUrl(media: any): string | undefined {
  if (!media) return undefined;
  if (typeof media === "object" && media.url) {
    return media.url.startsWith("/") ? `${BACKEND}${media.url}` : media.url;
  }
  return undefined;
}

function monthLabel(date: Date): string {
  return date.toLocaleString("en-US", { month: "short" });
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User>({});
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage (set at login)
    try {
      const raw = localStorage.getItem("currentUser");
      if (raw) setUser(JSON.parse(raw));
    } catch {}

    (async () => {
      try {
        const [e, c] = await Promise.all([
          api.get("/enrollments/my").catch(() => ({ data: { data: [] } })),
          api.get("/certificates/my").catch(() => ({ data: { data: [] } })),
        ]);
        setEnrollments(e.data.data || []);
        setCertificates(c.data.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Derived activity data ─────────────────────────────
  const activityData: ActivityPoint[] = useMemo(() => {
    const now = new Date();
    const months: ActivityPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ month: monthLabel(d), enrollments: 0, completions: 0 });
    }
    for (const e of enrollments) {
      if (e.enrolledAt) {
        const d = new Date(e.enrolledAt);
        const idx = months.findIndex((m, i) => {
          const md = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return d.getFullYear() === md.getFullYear() && d.getMonth() === md.getMonth();
        });
        if (idx >= 0) months[idx].enrollments++;
      }
      if (e.completedAt) {
        const d = new Date(e.completedAt);
        const idx = months.findIndex((m, i) => {
          const md = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
          return d.getFullYear() === md.getFullYear() && d.getMonth() === md.getMonth();
        });
        if (idx >= 0) months[idx].completions++;
      }
    }
    return months;
  }, [enrollments]);

  // ── Streak + weekly activity ──────────────────────────
  const streakAndWeek = useMemo(() => {
    const activeDates = new Set<number>();
    for (const e of enrollments) {
      if (e.lastAccessedAt) {
        activeDates.add(startOfDay(new Date(e.lastAccessedAt)));
      }
      if (e.enrolledAt) {
        activeDates.add(startOfDay(new Date(e.enrolledAt)));
      }
    }

    // Weekly active days (last 7 including today)
    const today = startOfDay(new Date());
    let weekDays = 0;
    for (let i = 0; i < 7; i++) {
      if (activeDates.has(today - i * 86_400_000)) weekDays++;
    }

    // Consecutive streak ending today
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      if (activeDates.has(today - i * 86_400_000)) streak++;
      else break;
    }

    return { activeDaysThisWeek: weekDays, streak };
  }, [enrollments]);

  const statusCounts: StatusCounts = useMemo(() => {
    return enrollments.reduce(
      (acc, e) => {
        if (e.progressPercent >= 100) acc.completed++;
        else if (e.progressPercent > 0) acc.inProgress++;
        else acc.notStarted++;
        return acc;
      },
      { notStarted: 0, inProgress: 0, completed: 0 }
    );
  }, [enrollments]);

  const progressCourses: ProgressCourse[] = useMemo(() => {
    return enrollments
      .filter((e) => e.progressPercent > 0 && e.progressPercent < 100)
      .sort((a, b) => b.progressPercent - a.progressPercent)
      .slice(0, 4)
      .map((e) => ({
        _id: e._id,
        title: e.course?.title || "Course",
        slug: e.course?.slug || "",
        progressPercent: e.progressPercent,
        lessonsCompleted: e.lessonsCompleted,
        lessonsTotal: e.course?.lessonsCount || 0,
        teacherName: e.course?.teacher?.name,
      }));
  }, [enrollments]);

  const continueCourses: ContinueCourse[] = useMemo(() => {
    return enrollments
      .filter((e) => e.progressPercent > 0 && e.progressPercent < 100)
      .sort((a, b) => {
        const aT = a.lastAccessedAt ? new Date(a.lastAccessedAt).getTime() : 0;
        const bT = b.lastAccessedAt ? new Date(b.lastAccessedAt).getTime() : 0;
        return bT - aT;
      })
      .slice(0, 4)
      .map((e) => ({
        _id: e._id,
        title: e.course?.title || "Course",
        slug: e.course?.slug || "",
        thumbnailUrl: e.course?.thumbnailUrl,        // ⭐ direct from backend
        progressPercent: e.progressPercent,
        teacherName: e.course?.teacher?.name,
        lessonsCompleted: e.lessonsCompleted,
        lessonsTotal: e.course?.lessonsCount || 0,
        nextLessonTitle: e.nextLesson?.title,         // ⭐ NEW
      }));
  }, [enrollments]);

  const tutors: TutorItem[] = useMemo(() => {
    const map = new Map<string, TutorItem>();
    for (const e of enrollments) {
      const t = e.course?.teacher;
      if (!t?._id) continue;
      const existing = map.get(t._id);
      if (existing) existing.courseCount++;
      else
        map.set(t._id, {
          _id: t._id,
          name: t.name,
          profileImageUrl: t.profileImageUrl,
          courseCount: 1,
        });
    }
    return Array.from(map.values()).slice(0, 4);
  }, [enrollments]);

  const hasAnyCourses = enrollments.length > 0;

  return (
    <div className="flex flex-col gap-5 py-4">
      <WelcomeBar
        name={user.name || "there"}
        streak={streakAndWeek.streak}
        activeDaysThisWeek={streakAndWeek.activeDaysThisWeek}
        weeklyGoal={WEEKLY_GOAL}
        inProgressCount={statusCounts.inProgress}
        hasAnyCourses={hasAnyCourses}
      />

      <QuickStats
        enrolled={enrollments.length}
        inProgress={statusCounts.inProgress}
        completed={statusCounts.completed}
        certificates={certificates.length}
        loading={loading}
      />

      <section className="flex flex-col-reverse gap-5 xl:flex-row">
        <div className="flex flex-[2] flex-col gap-5">
          <ActivityChart data={activityData} loading={loading} />
          <div className="flex flex-col gap-4 md:flex-row">
            <Statistics data={activityData} loading={loading} />
            <CourseActivities counts={statusCounts} loading={loading} />
          </div>
          <TopTutors tutors={tutors} loading={loading} />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <WeeklyGoal
            activeDays={streakAndWeek.activeDaysThisWeek}
            target={WEEKLY_GOAL}
            streak={streakAndWeek.streak}
          />
          <ContinueLearning courses={continueCourses} loading={loading} />
          <CourseProgressList courses={progressCourses} loading={loading} />
        </div>
      </section>
    </div>
  );
}