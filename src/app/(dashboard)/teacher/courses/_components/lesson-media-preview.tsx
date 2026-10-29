"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, X, Download } from "lucide-react";
import api from "@/lib/api";
import VideoPlayer from "@/components/global/video/player/video-player";

export function LessonMediaPreview({
  courseId,
  sectionId,
  lessonId,
  kind,
  label,
  poster,
}: {
  courseId: string;
  sectionId: string;
  lessonId: string;
  kind: "video" | "file";
  label?: string;
  poster?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get(
        `/teacher/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}/media`,
        { params: { kind } }
      );
      const fetched = r.data.data.url;

      if (kind === "file") {
        window.open(fetched, "_blank", "noopener,noreferrer");
        return;
      }
      setUrl(fetched);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  if (url && kind === "video") {
    return (
      <div className="relative mt-2">
        <VideoPlayer
          src={url}
          poster={poster}
          className="aspect-video w-full"
        />
        <button
          type="button"
          onClick={() => setUrl(null)}
          className="absolute right-2 top-2 z-30 rounded-lg bg-black/70 p-1.5 text-white transition-colors hover:bg-black/90"
          aria-label="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-lg"
        onClick={load}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : kind === "video" ? (
          <Play className="mr-2 h-3.5 w-3.5" />
        ) : (
          <Download className="mr-2 h-3.5 w-3.5" />
        )}
        {loading
          ? "Loading..."
          : label || (kind === "video" ? "Preview video" : "Download / view file")}
      </Button>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}