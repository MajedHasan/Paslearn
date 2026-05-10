"use client";

import { useState, useEffect } from "react";
import { TeacherFormStep } from "./teacher-form-step";
import { ChoosePlanStep } from "./choose-plan-step";
import { ChooseTemplateStep } from "./choose-template-step";
import { X } from "lucide-react";

interface BecomeTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export type TeacherFormData = {
  photo?: File;
  domain?: string;
  academicCareer: Array<{ schoolName: string }>;
  certificates: Array<{ name: string }>;
  reference: string;
  recommendation: string;
  recommendationImage?: File;
  customFields: Array<{ value: string }>;
  selectedPlan?: string;
  selectedTemplate?: string;
};

export function BecomeTeacherModal({
  open,
  onOpenChange,
}: BecomeTeacherModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TeacherFormData>({
    academicCareer: [{ schoolName: "" }],
    certificates: [{ name: "" }],
    reference: "",
    recommendation: "",
    customFields: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
  });

  const totalSteps = 3;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      academicCareer: [{ schoolName: "" }],
      certificates: [{ name: "" }],
      reference: "",
      recommendation: "",
      customFields: [
        { value: "" },
        { value: "" },
        { value: "" },
        { value: "" },
      ],
    });
    onOpenChange(false);
  };

  const updateFormData = (data: Partial<TeacherFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const stepTitles = [
    { title: "Teacher Application", subtitle: "Tell us about yourself" },
    { title: "Select Your Plan", subtitle: "Choose the perfect plan for you" },
    {
      title: "Choose Your Template",
      subtitle: "Pick your landing page design",
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 animate-in fade-in"
        onClick={handleClose}
      />

      <div className="relative z-50 w-[92vw] max-w-[1400px] h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-200">
        <div className="flex-shrink-0 bg-gradient-to-br from-[#0177fb] via-[#0156c7] to-[#0145b8] rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
          <div className="relative px-8 py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-white mb-1 tracking-tight drop-shadow-lg">
                  {stepTitles[currentStep - 1].title}
                </h2>
                <p className="text-blue-100 text-sm font-medium">
                  {stepTitles[currentStep - 1].subtitle}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/30 shadow-lg">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index < currentStep
                            ? "bg-white w-2"
                            : index === currentStep - 1
                            ? "bg-white w-6"
                            : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-bold text-sm">
                    {currentStep}/{totalSteps}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/90 hover:text-white hover:bg-white/20 rounded-full p-2.5 transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm"
                >
                  <div
                    className={`h-full bg-gradient-to-r from-white to-blue-100 rounded-full transition-all duration-700 ease-out ${
                      index < currentStep
                        ? "w-full"
                        : index === currentStep - 1
                        ? "w-full"
                        : "w-0"
                    }`}
                    style={{
                      boxShadow:
                        index <= currentStep - 1
                          ? "0 0 10px rgba(255,255,255,0.5)"
                          : "none",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-white">
          <div className="p-8">
            {currentStep === 1 && (
              <TeacherFormStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleClose}
              />
            )}
            {currentStep === 2 && (
              <ChoosePlanStep
                data={formData}
                onUpdate={updateFormData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <ChooseTemplateStep
                data={formData}
                onUpdate={updateFormData}
                onBack={handleBack}
                onComplete={handleClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
