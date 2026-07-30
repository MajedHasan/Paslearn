"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Crown,
  Sparkles,
  Zap,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Plan } from "@/types/plan/plan";

// ------------------------------
// Predefined colors – you can also add a 'color' field to Plan model later
// ------------------------------
const PLAN_COLORS = [
  {
    gradient: "from-green-500 to-emerald-600",
    border: "border-green-500",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    ring: "ring-green-500",
  },
  {
    gradient: "from-orange-500 to-amber-600",
    border: "border-orange-500",
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    ring: "ring-orange-500",
  },
  {
    gradient: "from-[#0177fb] to-[#0156c7]",
    border: "border-[#0177fb]",
    bg: "bg-blue-50",
    iconColor: "text-[#0177fb]",
    ring: "ring-[#0177fb]",
  },
  {
    gradient: "from-yellow-500 to-amber-600",
    border: "border-yellow-500",
    bg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    ring: "ring-yellow-500",
  },
  {
    gradient: "from-purple-500 to-violet-600",
    border: "border-purple-500",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    ring: "ring-purple-500",
  },
];

const ICON_MAP: Record<string, any> = {
  Zap,
  Star,
  Crown,
  TrendingUp,
  Sparkles,
};

interface ChoosePlanStepProps {
  data: { selectedPlan?: string };
  onUpdate: (data: Partial<{ selectedPlan: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ChoosePlanStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ChoosePlanStepProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(data.selectedPlan || "");
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  // Fetch active plans for teachers
  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/plans?role=teacher");
      const fetched: Plan[] = res?.data?.data || [];
      fetched.sort((a, b) => a.sortOrder - b.sortOrder);
      setPlans(fetched);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Assign a colour palette to each plan based on its index (or later plan.colour)
  const planColorMap = useMemo(() => {
    const map: Record<string, (typeof PLAN_COLORS)[0]> = {};
    plans.forEach((plan, i) => {
      map[plan._id] = PLAN_COLORS[i % PLAN_COLORS.length];
    });
    return map;
  }, [plans]);

  // Helper to render a feature's value in a pretty way
  const renderFeatureValue = (feature: Plan["features"][0]) => {
    if (feature.type === "boolean") return null;
    if (feature.type === "number")
      return `${feature.value}${feature.icon ? " " + feature.icon : ""}`;
    return `${feature.value}`;
  };

  // Determine badge type
  const getBadge = (plan: Plan) => {
    const badge = plan.badge?.toLowerCase();
    if (badge === "popular") return { type: "popular", label: "MOST POPULAR" };
    if (badge === "premium" || plan.isFeatured)
      return { type: "premium", label: "PREMIUM" };
    return null;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onUpdate({ selectedPlan: planId });
  };

  const handleNext = () => {
    if (!selectedPlan) {
      toast.error("Please select a plan");
      return;
    }
    toast.success(
      `${plans.find((p) => p._id === selectedPlan)?.name} plan selected!`
    );
    onNext();
  };

  // ---------- Loading / Error / Empty ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#0177fb] animate-spin" />
        <span className="ml-3 text-lg text-gray-500">Loading plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 font-semibold mb-2">Something went wrong</p>
        <p className="text-gray-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={loadPlans}>
          Try again
        </Button>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-semibold mb-2">No plans available</p>
        <p className="text-gray-500">Please check back later.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          ← Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-[#0177fb] to-[#0156c7] bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select the plan that best fits your teaching journey and unlock your
          potential
        </p>
      </div>

      <div
        className={`grid gap-6 justify-center ${
          plans.length === 1
            ? "grid-cols-1 max-w-md mx-auto"
            : plans.length === 2
            ? "md:grid-cols-2 max-w-2xl mx-auto"
            : plans.length === 3
            ? "md:grid-cols-3 max-w-4xl mx-auto"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {plans.map((plan, idx) => {
          const colors = planColorMap[plan._id];
          const isSelected = selectedPlan === plan._id;
          const isHovered = hoveredPlan === plan._id;
          const badge = getBadge(plan);
          const Icon = plan.icon && ICON_MAP[plan.icon] ? ICON_MAP[plan.icon] : Star;

          return (
            <div
              key={plan._id}
              onMouseEnter={() => setHoveredPlan(plan._id)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative rounded-3xl border-[3px] p-7 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${colors.border} shadow-2xl scale-105 ring-4 ring-opacity-20 ${colors.bg}`
                  : "border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
              } ${
                badge?.type === "popular" ? "ring-4 ring-blue-100 ring-opacity-50" : ""
              } bg-white transform ${
                isHovered && !isSelected ? "scale-105" : ""
              }`}
              onClick={() => handlePlanSelect(plan._id)}
            >
              {/* Premium badge (crown) */}
              {badge?.type === "premium" && (
                <div className="absolute -top-5 -right-5 z-10">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 shadow-2xl animate-bounce">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {/* Popular badge */}
              {badge?.type === "popular" && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-xl">
                    <Sparkles className="w-4 h-4" />
                    {badge.label}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-7 pt-4">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
                    colors.gradient
                  } flex items-center justify-center transform transition-transform ${
                    isHovered ? "scale-110 rotate-6" : ""
                  }`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-4 text-gray-900">
                  {plan.name}
                </h3>
                <div
                  className={`h-2 w-24 mx-auto mb-5 rounded-full bg-gradient-to-r ${colors.gradient}`}
                />
                <div className="mb-3">
                  <span className="text-gray-500 text-sm font-bold">
                    {plan.price.currency}{" "}
                  </span>
                  <span
                    className={`text-6xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}
                  >
                    {plan.price.amount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-semibold mb-1 capitalize">
                  {plan.price.billingCycle}
                </p>
                {plan.description && (
                  <p className={`text-sm ${colors.iconColor} font-medium mt-1`}>
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-7 min-h-[300px]">
                {plan.features.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-4">
                    No features listed.
                  </p>
                )}
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3 group/feature">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/feature:scale-110 ${
                        feature.type === "boolean"
                          ? feature.value
                            ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg"
                            : "bg-gray-200"
                          : "bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"
                      }`}
                    >
                      {feature.type === "boolean" ? (
                        feature.value ? (
                          <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
                        ) : (
                          <X className="w-4 h-4 text-gray-400" />
                        )
                      ) : (
                        <Check className="w-4 h-4 text-white font-bold" strokeWidth={3} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium leading-relaxed ${
                          feature.type === "boolean" && !feature.value
                            ? "text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {feature.label}
                        {feature.type !== "boolean" && (
                          <span className="ml-1 font-bold text-blue-700">
                            {renderFeatureValue(feature)}
                          </span>
                        )}
                      </p>
                      {feature.tooltip && (
                        <p className="text-xs text-gray-400 mt-0.5">{feature.tooltip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className={`w-full py-7 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
                  isSelected
                    ? `bg-gradient-to-r ${colors.gradient} text-white`
                    : `bg-gradient-to-r ${colors.gradient} text-white opacity-90 hover:opacity-100`
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelect(plan._id);
                }}
              >
                {isSelected
                  ? "✓ SELECTED"
                  : plan.ctaText || `GET ${plan.name.toUpperCase()}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-5 justify-end pt-8 border-t-2 border-gray-200">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="border-3 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 px-14 py-7 rounded-2xl text-base font-bold transition-all"
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedPlan}
          className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-14 py-7 rounded-2xl text-base font-black shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Templates →
        </Button>
      </div>
    </div>
  );
}