"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Sparkles, Search, Eye, Layers, Zap, TrendingUp, Activity,
} from "lucide-react";
import ExperienceTable from "./_components/ExperienceTable";
import { Experience } from "./utils/experience.types";
import ExperienceDialog from "./_components/ExperienceDialog";

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const res = await api.get("/experiences/admin");
      setExperiences(res?.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to load experiences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadExperiences(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return experiences;
    const q = search.toLowerCase();
    return experiences.filter(
      e => e.name.toLowerCase().includes(q) || e.key.toLowerCase().includes(q)
    );
  }, [experiences, search]);

  const total = experiences.length;
  const active = experiences.filter(e => e.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828] flex items-center gap-2">
            <Zap className="h-7 w-7 text-amber-500" />
            Experiences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage on‑site campaigns – popups, banners, full pages, and redirects.
          </p>
        </div>
          <ExperienceDialog onSaved={loadExperiences} triggerLabel="Create Experience" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Layers className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">Total Experiences</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">—</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-lg font-semibold">All Experiences</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search experiences..."
              className="pl-9 h-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <ExperienceTable experiences={filtered} reload={loadExperiences} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}