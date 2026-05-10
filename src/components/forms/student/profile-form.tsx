// app/(dashboard)/student/settings/_components/profile-form.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Loader as Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BecomeTeacherModal } from "@/app/(dashboard)/student/settings/_components/become-teacher-modal";
import api from "@/lib/api";
import { useAppSelector } from "@/hooks/useRedux";

const profileSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  bio: z.string().optional(),
  profilePicture: z.any().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const user = useAppSelector((state) => state.user.currentUser);

  useEffect(() => {
    console.log(user);
  }, [user]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    // fetch profile to populate fields
    async function loadProfile() {
      try {
        const res = await api.get("/student");
        console.log(res?.data);
        if (res?.data?.profile) {
          const p = res?.data?.profile;
          setValue("fullName", p.fullName || "");
          setValue("email", user?.email || "");
          setValue("username", p.username || "");
          setValue("phoneNumber", p.phoneNumber || "");
          setValue("bio", p.bio || "");
          if (p.profileImageUrl) setProfileImage(p.profileImageUrl);
        }
      } catch (err: any) {
        console.error("Load profile failed", err);
        // don't spam user if not logged in; show gentle toast for auth issues
      }
    }
    loadProfile();
  }, [setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("phoneNumber", data.phoneNumber);
      if (data.bio) formData.append("bio", data.bio);

      const fileInput = document.getElementById(
        "profile-picture"
      ) as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append("profilePicture", fileInput.files[0]);
      }

      // POST multipart/form-data
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
        }/student`,
        {
          method: "POST",
          credentials: localStorage.getItem("accessToken")
            ? "same-origin"
            : "include",
          headers: localStorage.getItem("accessToken")
            ? { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            : undefined,
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }

      const result = await response.json();
      toast.success("Profile updated successfully!");
      // update local image if backend returned profileImageUrl
      if (result.profile?.profileImageUrl)
        setProfileImage(result.profile.profileImageUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setProfileImage(null);
    const fileInput = document.getElementById(
      "profile-picture"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-[#4a5568] text-lg font-normal mb-8">
                Your Profile Picture
              </h1>
              <div className="relative">
                <label
                  htmlFor="profile-picture"
                  className="flex flex-col items-center justify-center w-[140px] h-[140px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-white"
                >
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${
                        profileImage.startsWith("data:image/")
                          ? profileImage
                          : `http://localhost:5001/uploads${profileImage}`
                      }`}
                      alt="Profile preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 text-center px-2">
                        Upload your photo
                      </span>
                    </>
                  )}
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <Button
              onClick={() => setTeacherModalOpen(true)}
              className="bg-themeStudentPrimary hover:bg-themeTeacherPrimary text-white px-8 py-6 rounded-lg text-base font-normal"
            >
              Become a teacher
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="fullName"
                  className="text-[#4a5568] text-base font-normal mb-2 block"
                >
                  Full name
                </Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  placeholder="Please enter your full name"
                  className="h-14 bg-[#f5f5f5] border-0 text-base placeholder:text-gray-400"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-[#4a5568] text-base font-normal mb-2 block"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  readOnly
                  value={user?.email}
                  placeholder="Please enter your email"
                  className="h-14 bg-[#f5f5f5] border-0 text-base placeholder:text-gray-400"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="username"
                  className="text-[#4a5568] text-base font-normal mb-2 block"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="Please enter your username"
                  className="h-14 bg-[#f5f5f5] border-0 text-base placeholder:text-gray-400"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="phoneNumber"
                  className="text-[#4a5568] text-base font-normal mb-2 block"
                >
                  Phone number
                </Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="Please enter your phone number"
                  className="h-14 bg-[#f5f5f5] border-0 text-base placeholder:text-gray-400"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phoneNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label
                htmlFor="bio"
                className="text-[#4a5568] text-base font-normal mb-2 block"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Write your Bio here e.g your hobbies, interests ETC"
                className="min-h-[200px] bg-[#f5f5f5] border-0 text-base placeholder:text-gray-400 resize-none"
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-themeStudentPrimary hover:bg-themeTeacherPrimary text-white px-12 py-6 rounded-lg text-base font-normal"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                variant="secondary"
                className="bg-[#e8e8e8] hover:bg-[#d8d8d8] text-[#4a5568] px-12 py-6 rounded-lg text-base font-normal"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
      <BecomeTeacherModal
        open={teacherModalOpen}
        onOpenChange={setTeacherModalOpen}
      />
    </>
  );
}
