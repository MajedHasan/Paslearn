"use client";

import React, { useEffect } from "react";
import type { Experience } from "@/app/(dashboard)/admin/experiences/utils/experience.types";
import DynamicFormExperience from "@/components/experiences/DynamicFormExperience";
import { useTrackImpression } from "@/hooks/useTrackImpression";

function getResourceKey(experience: Experience): string {
  if (!experience.content) return "";
  return experience.content.resourceKey || experience.content.resourceId || "";
}

interface Props {
  experience: Experience;
  onTrack?: (action: "click" | "close" | "convert") => void;
}

export default function ExperienceContent({ experience, onTrack }: Props) {
  const track = useTrackImpression();

  // Track "view" whenever the component is mounted (i.e., experience is shown)
  useEffect(() => {
    if (experience._id) {
      track(experience._id, "view");
    }
  }, [experience._id, track]);

  const { content } = experience;
  if (!content) return null;

  if (content.resourceType === "form") {
    const resourceKey = getResourceKey(experience);
    if (!resourceKey) return null;
    return (
      <DynamicFormExperience
        config={{
          resourceKey,
          embedded: true,
        }}
      />
    );
  }

  if (content.resourceType === "page") {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Page: <strong>{content.resourceKey || content.resourceId}</strong>
      </div>
    );
  }

  return null;
}