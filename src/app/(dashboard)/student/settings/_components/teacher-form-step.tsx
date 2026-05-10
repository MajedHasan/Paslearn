"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  X,
  Upload,
  CircleCheck,
  Trash2,
  GraduationCap,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { TeacherFormData } from "./become-teacher-modal";

interface TeacherFormStepProps {
  data: TeacherFormData;
  onUpdate: (data: Partial<TeacherFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function TeacherFormStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: TeacherFormStepProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [recommendationImagePreview, setRecommendationImagePreview] = useState<
    string | null
  >(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpdate({ photo: file });
      toast.success("Photo uploaded successfully!");
    }
  };

  const handleRecommendationImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecommendationImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onUpdate({ recommendationImage: file });
      toast.success("Recommendation image uploaded!");
    }
  };

  const addAcademicCareer = () => {
    onUpdate({
      academicCareer: [...data.academicCareer, { schoolName: "" }],
    });
  };

  const removeAcademicCareer = (index: number) => {
    if (data.academicCareer.length > 1) {
      const updated = data.academicCareer.filter((_, i) => i !== index);
      onUpdate({ academicCareer: updated });
    }
  };

  const updateAcademicCareer = (index: number, value: string) => {
    const updated = [...data.academicCareer];
    updated[index] = { schoolName: value };
    onUpdate({ academicCareer: updated });
  };

  const addCertificate = () => {
    onUpdate({
      certificates: [...data.certificates, { name: "" }],
    });
  };

  const removeCertificate = (index: number) => {
    if (data.certificates.length > 1) {
      const updated = data.certificates.filter((_, i) => i !== index);
      onUpdate({ certificates: updated });
    }
  };

  const updateCertificate = (index: number, value: string) => {
    const updated = [...data.certificates];
    updated[index] = { name: value };
    onUpdate({ certificates: updated });
  };

  const updateCustomField = (index: number, value: string) => {
    const updated = [...data.customFields];
    updated[index] = { value };
    onUpdate({ customFields: updated });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.domain) {
      newErrors.domain = "Domain is required";
    }

    if (data.academicCareer.some((career) => !career.schoolName)) {
      newErrors.academicCareer = "All school names are required";
    }

    if (data.certificates.some((cert) => !cert.name)) {
      newErrors.certificates = "All certificate names are required";
    }

    if (!data.reference) {
      newErrors.reference = "Reference is required";
    }

    if (!data.recommendation) {
      newErrors.recommendation = "Recommendation is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Profile Photo
            </h3>
            <p className="text-sm text-gray-500">
              Upload your professional photo
            </p>
          </div>
          {photoPreview && (
            <div className="flex items-center gap-2 text-[#0177fb] text-sm bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
              <CircleCheck className="w-4 h-4" />
              <span className="font-semibold">Uploaded</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-5">
          {photoPreview && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border-4 border-[#0177fb] shadow-lg ring-4 ring-blue-100">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <Button
              type="button"
              onClick={() => document.getElementById("teacher-photo")?.click()}
              className="bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-6 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {photoPreview ? "Change Photo" : "Upload Photo"}
            </Button>
            {photoPreview && (
              <Button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  onUpdate({ photo: undefined });
                }}
                variant="ghost"
                className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Photo
              </Button>
            )}
          </div>
          <input
            id="teacher-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <Label className="text-gray-800 text-base font-bold mb-3 block">
          Domain <span className="text-red-500">*</span>
        </Label>
        <Select
          value={data.domain}
          onValueChange={(value) => onUpdate({ domain: value })}
        >
          <SelectTrigger className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0177fb] focus:border-[#0177fb] transition-all text-sm">
            <SelectValue placeholder="Select your teaching domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">
              💻 Technology & Programming
            </SelectItem>
            <SelectItem value="business">💼 Business & Management</SelectItem>
            <SelectItem value="arts">🎨 Arts & Design</SelectItem>
            <SelectItem value="science">🔬 Science & Mathematics</SelectItem>
            <SelectItem value="language">🗣️ Languages</SelectItem>
            <SelectItem value="other">📚 Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.domain && (
          <p className="text-red-500 text-sm mt-2 font-medium">
            {errors.domain}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0177fb] to-[#0156c7] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Academic Background
              </h3>
              <p className="text-sm text-gray-500">
                List your educational institutions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addAcademicCareer}
            className="flex items-center gap-2 text-[#0177fb] hover:text-[#0156c7] font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {data.academicCareer.map((career, index) => (
            <div key={index} className="flex gap-3 group">
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-[#0177fb] transition-all">
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Institution {index + 1}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={career.schoolName}
                  onChange={(e) => updateAcademicCareer(index, e.target.value)}
                  placeholder="e.g., Harvard University"
                  className="h-11 bg-white border-0 text-sm rounded-lg"
                />
              </div>
              {data.academicCareer.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAcademicCareer(index)}
                  className="mt-8 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.academicCareer && (
          <p className="text-red-500 text-sm mt-2 font-medium">
            {errors.academicCareer}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Certifications
              </h3>
              <p className="text-sm text-gray-500">
                Add your professional certifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={addCertificate}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold bg-green-50 hover:bg-green-100 px-4 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="space-y-3">
          {data.certificates.map((cert, index) => (
            <div key={index} className="flex gap-3 group">
              <div className="flex-1 bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-green-500 transition-all">
                <Label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Certificate {index + 1}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={cert.name}
                  onChange={(e) => updateCertificate(index, e.target.value)}
                  placeholder="e.g., Certified Professional Educator"
                  className="h-11 bg-white border-0 text-sm rounded-lg"
                />
              </div>
              {data.certificates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCertificate(index)}
                  className="mt-8 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.certificates && (
          <p className="text-red-500 text-sm mt-2 font-medium">
            {errors.certificates}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
          <Label className="text-gray-800 text-base font-bold mb-3 block">
            Reference Contact <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.reference}
            onChange={(e) => onUpdate({ reference: e.target.value })}
            placeholder="Name or email"
            className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0177fb] text-sm"
          />
          {errors.reference && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.reference}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
          <Label className="text-gray-800 text-base font-bold mb-3 block">
            Recommendation Contact <span className="text-red-500">*</span>
          </Label>
          <Input
            value={data.recommendation}
            onChange={(e) => onUpdate({ recommendation: e.target.value })}
            placeholder="Name or email"
            className="h-12 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-[#0177fb] text-sm"
          />
          {errors.recommendation && (
            <p className="text-red-500 text-sm mt-2 font-medium">
              {errors.recommendation}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <Label className="text-gray-800 text-base font-bold mb-4 block text-center">
          Recommendation Letter (Optional)
        </Label>
        <div className="flex justify-center">
          {recommendationImagePreview ? (
            <div className="relative w-full max-w-md h-64 rounded-xl border-4 border-[#0177fb] overflow-hidden shadow-lg">
              <img
                src={recommendationImagePreview}
                alt="Recommendation"
                className="w-full h-full object-contain bg-gray-50"
              />
              <Button
                type="button"
                onClick={() => {
                  setRecommendationImagePreview(null);
                  onUpdate({ recommendationImage: undefined });
                }}
                size="sm"
                variant="destructive"
                className="absolute top-3 right-3 rounded-full shadow-xl"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor="recommendation-image"
              className="relative flex flex-col items-center justify-center w-full max-w-md h-48 border-3 border-dashed border-[#0177fb] rounded-xl cursor-pointer hover:border-[#0156c7] hover:bg-blue-50 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0177fb] to-[#0156c7] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <span className="text-base text-gray-700 font-semibold">
                Click to upload
              </span>
              <span className="text-sm text-gray-400 mt-2">
                PNG, JPG up to 5MB
              </span>
            </label>
          )}
          <input
            id="recommendation-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleRecommendationImageChange}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all">
        <Label className="text-gray-800 text-base font-bold mb-4 block">
          Additional Information (Optional)
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {data.customFields.map((field, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200 hover:border-[#0177fb] transition-all"
            >
              <Label className="text-gray-700 text-sm font-semibold mb-2 block">
                Field {index + 1}
              </Label>
              <Input
                value={field.value}
                onChange={(e) => updateCustomField(index, e.target.value)}
                placeholder="Enter value"
                className="h-10 bg-white border-0 text-sm rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 border-2 border-gray-300 hover:bg-gray-100 text-gray-700 px-6 py-6 rounded-xl text-base font-bold transition-all hover:border-gray-400"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1 bg-gradient-to-r from-[#0177fb] to-[#0156c7] hover:from-[#0156c7] hover:to-[#0177fb] text-white px-6 py-6 rounded-xl text-base font-bold shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02]"
        >
          Continue to Plans →
        </Button>
      </div>
    </div>
  );
}
