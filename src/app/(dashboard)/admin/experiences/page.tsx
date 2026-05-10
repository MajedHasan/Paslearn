"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExperienceTable from "./_components/ExperienceTable";
import { Experience } from "./utils/experience.types";
import { toast } from "sonner";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const res = await api.get("/experiences/admin");

      // adjust this if your api wrapper returns data differently
      setExperiences(res?.data?.data || res?.data || []);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load experiences",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiences();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Experiences</h1>
          <p className="text-sm text-muted-foreground">
            Manage maintenance, waitlist, coming soon, popups, and future
            builder-based experiences.
          </p>
        </div>
      </div>

      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Runtime Control</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Use this panel to enable or disable full-page experiences and popup
          experiences without redeploying.
        </CardContent>
      </Card>

      <ExperienceTable experiences={experiences} reload={loadExperiences} />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : null}
    </div>
  );
}
