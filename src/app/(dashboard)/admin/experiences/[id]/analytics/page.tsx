"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, Eye, MousePointerClick, Activity, TrendingUp,
  Zap, Monitor, PanelTop, ArrowRightLeft, Layers3, Calendar,
  Smartphone, Globe, Clock, BarChart3, Target, Percent,
} from "lucide-react";
import { Experience } from "../../utils/experience.types";

interface AnalyticsData {
  totals: { views: number; interactions: number; conversions: number };
  conversionRate: number;
  lastViewedAt: string | null;
  byDay: { date: string; views: number; interactions: number; conversions: number }[];
  byDevice: { device: string; count: number }[];
  byReferrer: { referrer: string; count: number }[];
}

export default function ExperienceAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [expRes, anaRes] = await Promise.all([
          api.get(`/experiences/admin/${params.id}`),
          api.get(`/experiences/admin/${params.id}/analytics?days=${days}`),
        ]);
        setExperience(expRes.data?.data);
        setAnalytics(anaRes.data?.data);
      } catch (err: any) {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) load();
  }, [params.id, days]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!experience || !analytics) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Experience not found.</p>
        <Button onClick={() => router.push("/admin/experiences")} className="mt-4">Back to Experiences</Button>
      </div>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    full_page: <Monitor className="h-5 w-5" />,
    popup: <PanelTop className="h-5 w-5" />,
    banner: <Layers3 className="h-5 w-5" />,
    redirect: <ArrowRightLeft className="h-5 w-5" />,
  };

  const { totals, conversionRate, lastViewedAt, byDay, byDevice, byReferrer } = analytics;
  const views = totals.views;
  const interactions = totals.interactions;
  const conversions = totals.conversions;
  const maxTrend = Math.max(...byDay.map(d => d.views), 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/experiences")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="gap-1">{typeIcons[experience.type]} {experience.type}</Badge>
              <Badge variant={experience.enabled ? "default" : "secondary"}>
                {experience.enabled ? "Active" : "Inactive"}
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900">{experience.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analytics for the last {days} days
            </p>
          </div>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{views.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Views</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{interactions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Interactions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conversions.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Conversions</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart & Side Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-[#E6E8EC] shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" /> Daily Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byDay.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No data yet</div>
            ) : (
              <div className="flex items-end justify-between h-48 gap-1">
                {byDay.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-[30px]">
                    <span className="text-xs font-semibold">{day.views}</span>
                    <div
                      className="w-full bg-amber-200 rounded-t-md transition-all hover:bg-amber-300"
                      style={{ height: `${(day.views / maxTrend) * 100}%` }}
                    />
                    <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-top-left whitespace-nowrap">
                      {day.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Views</span>
              <span className="font-bold">{views}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interactions</span>
              <span className="font-bold">{interactions}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: views ? `${(interactions/views)*100}%` : '0%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversions</span>
              <span className="font-bold">{conversions}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: views ? `${(conversions/views)*100}%` : '0%' }} />
            </div>
            {lastViewedAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Clock className="h-3.5 w-3.5" />
                Last viewed: {new Date(lastViewedAt).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device & Referrer Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-amber-500" /> By Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-3">
                {byDevice.map((d) => (
                  <div key={d.device} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{d.device}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${(d.count / Math.max(...byDevice.map(x => x.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{d.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#E6E8EC] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-500" /> By Referrer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byReferrer.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-3">
                {byReferrer.slice(0, 5).map((r) => (
                  <div key={r.referrer} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[150px]">{r.referrer}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 h-2 rounded-full">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(r.count / Math.max(...byReferrer.map(x => x.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{r.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Experience Details */}
      <Card className="border-[#E6E8EC] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" /> Experience Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize flex items-center gap-1">{typeIcons[experience.type]} {experience.type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Content</p>
              <p className="font-medium">{experience.content?.resourceType}: {experience.content?.resourceKey || experience.content?.resourceId || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium">{experience.priority}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-medium">{experience.target?.scope === "global" ? "All pages" : "Specific routes"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trigger</p>
              <p className="font-medium">{experience.trigger?.type || "Always"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium flex items-center gap-1"><Calendar className="h-4 w-4" /> {experience.updatedAt ? new Date(experience.updatedAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}