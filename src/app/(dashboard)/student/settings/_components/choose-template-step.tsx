"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TeacherFormData } from "./become-teacher-modal";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Loader as Loader2,
  CheckCircle2,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------- Types ----------------------
interface Theme {
  _id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  category?: { _id: string; name: string };
  tags: string[];
  pages: any[];
  modules: any[];
}

const CARD_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-green-500 to-teal-500",
  "from-indigo-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-amber-500",
  "from-teal-500 to-green-500",
];

interface ChooseTemplateStepProps {
  data: TeacherFormData;
  onUpdate: (data: Partial<TeacherFormData>) => void;
  onBack: () => void;
  onComplete: () => void; // can be kept for parent modal logic if needed
}

export function ChooseTemplateStep({
  data,
  onUpdate,
  onBack,
  onComplete,
}: ChooseTemplateStepProps) {
  const router = useRouter();

  // ---------------------- State ----------------------
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState(
    data.selectedTemplate || ""
  );
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [sliderIndexes, setSliderIndexes] = useState<Record<string, number>>(
    {}
  );

  // ---------------------- Helpers ----------------------
  const getThumbnails = (theme: Theme): string[] => {
    return theme.thumbnail ? [theme.thumbnail] : [];
  };

  const handlePrevImage = (themeId: string, total: number) => {
    setSliderIndexes((prev) => ({
      ...prev,
      [themeId]: ((prev[themeId] ?? 0) - 1 + total) % total,
    }));
  };

  const handleNextImage = (themeId: string, total: number) => {
    setSliderIndexes((prev) => ({
      ...prev,
      [themeId]: ((prev[themeId] ?? 0) + 1) % total,
    }));
  };

  // ---------------------- Fetch themes ----------------------
  const loadThemes = async () => {
    try {
      setLoadingThemes(true);
      setError(null);
      const res = await api.get("/themes");
      const fetched = res?.data?.data || [];
      setThemes(fetched);
      const initialIndices: Record<string, number> = {};
      fetched.forEach((t: Theme) => (initialIndices[t._id] = 0));
      setSliderIndexes(initialIndices);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load themes");
    } finally {
      setLoadingThemes(false);
    }
  };

  useEffect(() => {
    loadThemes();
  }, []);

  // ---------------------- Selection handler ----------------------
  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId);
    onUpdate({ selectedTemplate: themeId });
    const theme = themes.find((t) => t._id === themeId);
    toast.success(`${theme?.name || "Theme"} selected!`);
  };

  // ---------------------- Submit ----------------------
  const handleSubmit = async () => {
    if (!selectedThemeId) {
      toast.error("Please select a template to continue");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      if (data.photo) formData.append("photo", data.photo);
      formData.append("domain", data.domain || "");
      formData.append("academicCareer", JSON.stringify(data.academicCareer));
      formData.append("certificates", JSON.stringify(data.certificates));
      formData.append("reference", data.reference || "");
      formData.append("recommendation", data.recommendation || "");
      if (data.recommendationImage)
        formData.append("recommendationImage", data.recommendationImage);
      formData.append("customFields", JSON.stringify(data.customFields || {}));
      formData.append("selectedPlan", data.selectedPlan || "");
      formData.append("selectedTemplate", selectedThemeId);

      const response = await api.post("/teacher-profile/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { status } = response.data.data; // teacher profile status

      if (status === "active") {
        toast.success("🎉 Application approved! Your teacher account is now active.");
      } else if (status === "pending_payment") {
        toast.info(
          "✅ Application received! Please complete the payment to activate your account.",
          { duration: 6000 }
        );
      } else {
        toast.success("Application submitted successfully!");
      }

      // Redirect to teacher dashboard after a short delay
      setTimeout(() => {
        router.push("/teacher");
      }, 1500);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit application. Please try again."
      );
      console.error("Error submitting teacher application:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------- Loading skeleton ----------------------
  if (loadingThemes) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto">
        <div className="text-center">
          <h3 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-[#0177fb] to-[#0156c7] bg-clip-text text-transparent">
            Loading Templates...
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden border border-gray-200 bg-white shadow-lg animate-pulse"
            >
              <div className="aspect-[4/5] bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------- Error state ----------------------
  if (error) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto text-center">
        <div className="py-20">
          <ImageIcon className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg mb-2">
            Could not load templates
          </p>
          <p className="text-gray-500">{error}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => loadThemes()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------- Empty state ----------------------
  if (themes.length === 0) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto text-center">
        <div className="py-20">
          <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold text-lg mb-2">
            No templates available
          </p>
          <p className="text-gray-500">Please check back later.</p>
          <Button variant="outline" className="mt-6" onClick={onBack}>
            ← Back
          </Button>
        </div>
      </div>
    );
  }

  // ---------------------- Main render ----------------------
  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div className="text-center">
        <h3 className="text-4xl font-black text-gray-900 mb-3 bg-gradient-to-r from-[#0177fb] to-[#0156c7] bg-clip-text text-transparent">
          Choose Your Landing Page
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a stunning theme to showcase your courses and attract students
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {themes.map((theme, idx) => {
          const isSelected = selectedThemeId === theme._id;
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          const thumbnails = getThumbnails(theme);
          const currentSlide = sliderIndexes[theme._id] ?? 0;
          const totalSlides = thumbnails.length;

          return (
            <div
              key={theme._id}
              className={`relative rounded-3xl overflow-hidden border-3 transition-all duration-500 cursor-pointer group ${
                isSelected
                  ? "border-[#0177fb] shadow-2xl scale-105 ring-4 ring-blue-200"
                  : "border-gray-200 hover:border-[#0177fb] shadow-lg hover:shadow-2xl"
              } bg-white transform hover:scale-105`}
              onClick={() => handleThemeSelect(theme._id)}
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
                {totalSlides > 0 ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={thumbnails[currentSlide]}
                        alt={theme.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>

                    {totalSlides > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevImage(theme._id, totalSlides);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-800" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextImage(theme._id, totalSlides);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-800" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {thumbnails.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSliderIndexes((prev) => ({
                                  ...prev,
                                  [theme._id]: dotIdx,
                                }));
                              }}
                              className={`w-2 h-2 rounded-full transition-all ${
                                dotIdx === currentSlide
                                  ? "bg-white scale-125"
                                  : "bg-white/50 hover:bg-white/80"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">No preview</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 pointer-events-none" />
                <div className="absolute top-6 left-6 right-6">
                  <div
                    className={`inline-block bg-gradient-to-r ${color} px-4 py-2 rounded-full shadow-lg`}
                  >
                    <span className="text-white text-xs font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {theme.category?.name || theme.tags[0] || "Theme"}
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/60 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                    <h3 className="text-white text-xl font-black mb-1 tracking-tight">
                      {theme.name}
                    </h3>
                    <p className="text-blue-200 text-sm font-semibold line-clamp-2">
                      {theme.description || "A beautiful theme for your courses"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-semibold">
                    {theme.pages?.length || 0} pages ·{" "}
                    {theme.modules?.length || 0} modules
                  </span>
                  <button
                    className={`text-sm font-black transition-all px-4 py-2 rounded-xl ${
                      isSelected
                        ? "text-[#0177fb] bg-blue-50"
                        : "text-gray-700 hover:text-[#0177fb] hover:bg-blue-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleThemeSelect(theme._id);
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

      <div className="flex gap-5 justify-end pt-8 border-t-2 border-gray-200">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          disabled={submitting}
          className="border-3 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 px-14 py-7 rounded-2xl text-base font-bold transition-all"
        >
          ← Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !selectedThemeId}
          className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-14 py-7 rounded-2xl text-base font-black shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {submitting ? (
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