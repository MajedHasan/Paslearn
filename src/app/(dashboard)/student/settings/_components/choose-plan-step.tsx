"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Crown, Sparkles, Zap, Star, TrendingUp } from "lucide-react";
import { TeacherFormData } from "./become-teacher-modal";
import { toast } from "sonner";

interface ChoosePlanStepProps {
  data: TeacherFormData;
  onUpdate: (data: Partial<TeacherFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const plans = [
  {
    id: "free-trial",
    name: "FREE TRIAL",
    price: "0",
    period: "7-day period",
    color: "from-green-500 to-emerald-600",
    borderColor: "border-green-500",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    icon: Zap,
    features: [
      { text: "Free courses access", included: true },
      { text: "Limited course materials", included: true },
      { text: "Basic community support", included: true },
      { text: "No certification", included: true },
      { text: "Ad-supported platform", included: true },
      { text: "Pro Plan community forums", included: false },
      { text: "Early access to updates", included: false },
    ],
    buttonText: "START FREE TRIAL",
    popular: false,
  },
  {
    id: "bronze",
    name: "BRONZE",
    price: "9",
    period: "7-day period",
    color: "from-orange-500 to-amber-600",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    icon: TrendingUp,
    features: [
      { text: "Free courses access", included: true },
      { text: "Limited course materials", included: true },
      { text: "Basic community support", included: true },
      { text: "No certification", included: true },
      { text: "Ad-supported platform", included: true },
      { text: "Pro Plan community forums", included: true },
      { text: "Early access to updates", included: true },
    ],
    buttonText: "GET BRONZE",
    popular: false,
  },
  {
    id: "silver",
    name: "SILVER",
    price: "12",
    period: "6-months period",
    periodExtra: "Premium Support",
    color: "from-[#0177fb] to-[#0156c7]",
    borderColor: "border-[#0177fb]",
    bgColor: "bg-blue-50",
    iconColor: "text-[#0177fb]",
    icon: Star,
    features: [
      { text: "Unlimited course access", included: true },
      { text: "Full course materials", included: true },
      { text: "Priority support", included: true },
      { text: "Completion certificates", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Pro community forums", included: true },
      { text: "Early access to courses", included: true },
    ],
    buttonText: "GET STARTED",
    popular: true,
  },
  {
    id: "gold",
    name: "GOLD",
    price: "20",
    period: "1-year period",
    periodExtra: "Premium Support",
    color: "from-yellow-500 to-amber-600",
    borderColor: "border-yellow-500",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    icon: Crown,
    features: [
      { text: "Unlimited course access", included: true },
      { text: "Full course materials", included: true },
      { text: "Priority support", included: true },
      { text: "Completion certificates", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Pro community forums", included: true },
      { text: "Early access to courses", included: true },
    ],
    buttonText: "UPGRADE TO GOLD",
    popular: false,
    premium: true,
  },
];

export function ChoosePlanStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ChoosePlanStepProps) {
  const [selectedPlan, setSelectedPlan] = useState(
    data.selectedPlan || "silver"
  );
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

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
      `${plans.find((p) => p.id === selectedPlan)?.name} plan selected!`
    );
    onNext();
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const isHovered = hoveredPlan === plan.id;

          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              className={`relative rounded-3xl border-3 p-7 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${
                      plan.borderColor
                    } shadow-2xl scale-105 ring-4 ring-opacity-20 ${plan.bgColor.replace(
                      "bg-",
                      "ring-"
                    )}`
                  : "border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
              } ${
                plan.popular ? "ring-4 ring-blue-100 ring-opacity-50" : ""
              } bg-white transform ${
                isHovered && !isSelected ? "scale-105" : ""
              }`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.premium && (
                <div className="absolute -top-5 -right-5 z-10">
                  <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 shadow-2xl animate-bounce">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] text-white px-5 py-2 rounded-full text-xs font-black flex items-center gap-2 shadow-xl">
                    <Sparkles className="w-4 h-4" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="text-center mb-7 pt-4">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${
                    plan.color
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
                  className={`h-2 w-24 mx-auto mb-5 rounded-full bg-gradient-to-r ${plan.color}`}
                />
                <div className="mb-3">
                  <span className="text-gray-500 text-sm font-bold">MAD </span>
                  <span
                    className={`text-6xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                  >
                    {plan.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-semibold mb-1">
                  {plan.period}
                </p>
                {plan.periodExtra && (
                  <p className={`text-sm ${plan.iconColor} font-black`}>
                    {plan.periodExtra}
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-7 min-h-[300px]">
                {plan.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 group/feature"
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover/feature:scale-110 ${
                        feature.included
                          ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg"
                          : "bg-gray-200"
                      }`}
                    >
                      {feature.included ? (
                        <Check
                          className="w-4 h-4 text-white font-bold"
                          strokeWidth={3}
                        />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span
                      className={`text-sm flex-1 leading-relaxed font-medium ${
                        feature.included ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={`w-full py-7 rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 ${
                  isSelected
                    ? `bg-gradient-to-r ${plan.color} text-white`
                    : `bg-gradient-to-r ${plan.color} text-white opacity-90 hover:opacity-100`
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanSelect(plan.id);
                }}
              >
                {isSelected ? "✓ SELECTED" : plan.buttonText}
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
          className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-14 py-7 rounded-2xl text-base font-black shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
        >
          Continue to Templates →
        </Button>
      </div>
    </div>
  );
}
