"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TeacherFormData } from "./become-teacher-modal";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Loader as Loader2,
  CircleCheck as CheckCircle2,
  Eye,
  Sparkles,
} from "lucide-react";

interface ChooseTemplateStepProps {
  data: TeacherFormData;
  onUpdate: (data: Partial<TeacherFormData>) => void;
  onBack: () => void;
  onComplete: () => void;
}

const templates = [
  {
    id: "template-1",
    image:
      "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "MODERN EDUCATION",
    subtitle: "E-learning Platform",
    category: "Modern",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "template-2",
    image:
      "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "LANGUAGE ACADEMY",
    subtitle: "Language Learning",
    category: "Professional",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "template-3",
    image:
      "https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "CREATIVE STUDIO",
    subtitle: "Design & Arts",
    category: "Minimalist",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "template-4",
    image:
      "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "BUSINESS PRO",
    subtitle: "Corporate Training",
    category: "Corporate",
    color: "from-green-500 to-teal-500",
  },
  {
    id: "template-5",
    image:
      "https://images.pexels.com/photos/5212324/pexels-photo-5212324.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "TECH ACADEMY",
    subtitle: "Technology Courses",
    category: "Tech",
    color: "from-indigo-500 to-blue-500",
  },
  {
    id: "template-6",
    image:
      "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "WELLNESS CENTER",
    subtitle: "Health & Lifestyle",
    category: "Elegant",
    color: "from-pink-500 to-rose-500",
  },
];

export function ChooseTemplateStep({
  data,
  onUpdate,
  onBack,
  onComplete,
}: ChooseTemplateStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState(
    data.selectedTemplate || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const totalPages = 5;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onUpdate({ selectedTemplate: templateId });
    const template = templates.find((t) => t.id === templateId);
    toast.success(`${template?.title} template selected!`);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template to continue");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      if (data.photo) {
        formData.append("photo", data.photo);
      }

      formData.append("domain", data.domain || "");
      formData.append("academicCareer", JSON.stringify(data.academicCareer));
      formData.append("certificates", JSON.stringify(data.certificates));
      formData.append("reference", data.reference);
      formData.append("recommendation", data.recommendation);

      if (data.recommendationImage) {
        formData.append("recommendationImage", data.recommendationImage);
      }

      formData.append("customFields", JSON.stringify(data.customFields));
      formData.append("selectedPlan", data.selectedPlan || "");
      formData.append("selectedTemplate", selectedTemplate);

      const response = await api.post("/teacher/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("🎉 Application submitted successfully!");
      console.log("Teacher application response:", response.data);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
      console.error("Error submitting teacher application:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-[#0177fb] to-[#0156c7] bg-clip-text text-transparent">
          Choose Your Landing Page
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a stunning template to showcase your courses and attract
          students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;

          return (
            <div
              key={template.id}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`relative rounded-3xl overflow-hidden border-3 transition-all duration-500 cursor-pointer group ${
                isSelected
                  ? "border-[#0177fb] shadow-2xl scale-105 ring-4 ring-blue-200"
                  : "border-gray-200 hover:border-[#0177fb] shadow-lg hover:shadow-2xl"
              } bg-white transform ${
                isHovered && !isSelected ? "scale-105" : ""
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 z-30">
                  <div className="bg-gradient-to-br from-[#0177fb] to-[#0156c7] rounded-full p-3 shadow-2xl animate-pulse">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              )}

              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white transition-all">
                  <Eye className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              <div className="relative aspect-[4/5] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={template.image}
                    alt={template.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      isHovered ? "scale-110" : "scale-100"
                    }`}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                <div className="absolute top-6 left-6 right-6">
                  <div
                    className={`inline-block bg-gradient-to-r ${template.color} px-4 py-2 rounded-full shadow-lg`}
                  >
                    <span className="text-white text-xs font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {template.category}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white text-xl font-black mb-1 tracking-tight">
                      {template.title}
                    </h3>
                    <p className="text-blue-200 text-sm font-semibold">
                      {template.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-semibold">
                    Production Ready
                  </span>
                  <button
                    className={`text-sm font-black transition-all px-4 py-2 rounded-xl ${
                      isSelected
                        ? "text-[#0177fb] bg-blue-50"
                        : "text-gray-700 hover:text-[#0177fb] hover:bg-blue-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateSelect(template.id);
                    }}
                  >
                    {isSelected ? "✓ Selected" : "Select →"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <Button
          variant="outline"
          size="icon"
          className="border-2 border-[#0177fb] hover:bg-[#0177fb] hover:text-white text-[#0177fb] w-12 h-12 rounded-xl transition-all font-bold"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          ←
        </Button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <Button
            key={index}
            variant="outline"
            size="icon"
            className={`w-12 h-12 rounded-xl font-bold transition-all ${
              currentPage === index + 1
                ? "bg-gradient-to-r from-[#0177fb] to-[#0156c7] text-white border-0 shadow-xl scale-110"
                : "border-2 border-gray-300 text-gray-600 hover:border-[#0177fb] hover:text-[#0177fb] hover:scale-105"
            }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          className="border-2 border-[#0177fb] hover:bg-[#0177fb] hover:text-white text-[#0177fb] w-12 h-12 rounded-xl transition-all font-bold"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          →
        </Button>
      </div>

      <div className="flex gap-5 justify-end pt-8 border-t-2 border-gray-200">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          disabled={isLoading}
          className="border-3 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 px-14 py-7 rounded-2xl text-base font-bold transition-all"
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !selectedTemplate}
          className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-14 py-7 rounded-2xl text-base font-black shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>Submit Application ✓</>
          )}
        </Button>
      </div>
    </div>
  );
}
