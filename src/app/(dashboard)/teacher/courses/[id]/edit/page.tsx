"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CourseBuilder } from "../../_components/course-builder";
import { LoadingState, ErrorState } from "../../_components/ui";
import api from "@/lib/api";

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(`/teacher/courses/${id}`);
      setCourse(r.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) return <LoadingState label="Loading course..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!course) return <ErrorState message="Course not found" />;

  return <CourseBuilder courseId={id} initialData={course} />;
}