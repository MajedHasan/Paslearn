"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, BookOpen, DollarSign, Layers, Settings, Save,
  Plus, Trash2, GripVertical, Eye, EyeOff, Star, Users, Clock,
  Upload, ImageIcon, ArrowUp, ArrowDown, Play, FileText, CheckSquare,
  Radio, AlignLeft, AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────
type LessonType = "video" | "text" | "quiz" | "assignment" | "file";
type QuestionType = "multiple_choice" | "true_false" | "short_answer";
type PriceModel = "free" | "onetime" | "subscription";
type CompletionCriteria = "watch_all" | "pass_quiz" | "manual";

type Question = {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
};

type LessonContent = {
  videoUrl?: string;
  videoEmbed?: string;
  textContent?: string;
  quizQuestions?: Question[];
  assignmentInstructions?: string;
  fileUrl?: string;
};

type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  duration?: number;
  freePreview: boolean;
  dripDays: number;
  content: LessonContent;
};

type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type PriceTier = {
  id: string;
  name: string;
  price: number;
  interval: "one_time" | "monthly" | "yearly";
};

const initialDraft = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  subcategory: "",
  tags: [] as string[],
  difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
  language: "English",
  thumbnail: null as string | null,
  promoVideo: "",
  badge: "",
  slug: "",
  seoTitle: "",
  seoDescription: "",
  learningObjectives: [] as string[],
  requirements: [] as string[],
  audience: [] as string[],
  sections: [] as Section[],
  priceModel: "onetime" as PriceModel,
  priceTiers: [] as PriceTier[],
  discountPercent: 0,
  couponCode: "",
  enrollmentLimit: 0,
  prerequisites: [] as string[],
  certificateEnabled: false,
  certificateTemplate: "default",
  completionCriteria: "watch_all" as CompletionCriteria,
  accessDuration: 0,
  instructorBio: "",
  integrations: [] as string[],
  courseLevel: "all" as "all" | "beginner" | "intermediate" | "advanced",
  publishStatus: "draft" as "draft" | "published",
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft);
  const [activeStep, setActiveStep] = useState<
    "overview" | "curriculum" | "pricing" | "settings" | "publish"
  >("overview");
  const [tagInput, setTagInput] = useState("");
  const [objectiveInput, setObjectiveInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [audienceInput, setAudienceInput] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const update = (patch: Partial<typeof initialDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }));

  // list helpers
  const addTag = () => { const t = tagInput.trim(); if (t && !draft.tags.includes(t)) update({ tags: [...draft.tags, t] }); setTagInput(""); };
  const removeTag = (tag: string) => update({ tags: draft.tags.filter(x => x !== tag) });
  const addObjective = () => { const o = objectiveInput.trim(); if (o && !draft.learningObjectives.includes(o)) update({ learningObjectives: [...draft.learningObjectives, o] }); setObjectiveInput(""); };
  const removeObjective = (o: string) => update({ learningObjectives: draft.learningObjectives.filter(x => x !== o) });
  const addRequirement = () => { const r = requirementInput.trim(); if (r && !draft.requirements.includes(r)) update({ requirements: [...draft.requirements, r] }); setRequirementInput(""); };
  const removeRequirement = (r: string) => update({ requirements: draft.requirements.filter(x => x !== r) });
  const addAudience = () => { const a = audienceInput.trim(); if (a && !draft.audience.includes(a)) update({ audience: [...draft.audience, a] }); setAudienceInput(""); };
  const removeAudience = (a: string) => update({ audience: draft.audience.filter(x => x !== a) });

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { const result = reader.result as string; setThumbnailPreview(result); update({ thumbnail: result }); };
      reader.readAsDataURL(file);
    }
  };

  // curriculum
  const addSection = () => { const newSection: Section = { id: `section_${Date.now()}`, title: "New Section", lessons: [] }; update({ sections: [...draft.sections, newSection] }); };
  const updateSectionTitle = (id: string, title: string) => update({ sections: draft.sections.map(s => s.id === id ? { ...s, title } : s) });
  const removeSection = (id: string) => update({ sections: draft.sections.filter(s => s.id !== id) });
  const moveSection = (id: string, direction: "up" | "down") => { const idx = draft.sections.findIndex(s => s.id === id); if (idx === -1) return; const newIdx = direction === "up" ? idx - 1 : idx + 1; if (newIdx < 0 || newIdx >= draft.sections.length) return; const sections = [...draft.sections]; [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]]; update({ sections }); };
  const addLesson = (sectionId: string) => { const newLesson: Lesson = { id: `lesson_${Date.now()}`, title: "New Lesson", type: "video", duration: 0, freePreview: false, dripDays: 0, content: {} }; update({ sections: draft.sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s) }); setExpandedLesson(newLesson.id); };
  const updateLesson = (sectionId: string, lessonId: string, patch: Partial<Lesson>) => update({ sections: draft.sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, ...patch } : l) } : s) });
  const removeLesson = (sectionId: string, lessonId: string) => update({ sections: draft.sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s) });
  const moveLesson = (sectionId: string, lessonId: string, direction: "up" | "down") => { const section = draft.sections.find(s => s.id === sectionId); if (!section) return; const idx = section.lessons.findIndex(l => l.id === lessonId); if (idx === -1) return; const newIdx = direction === "up" ? idx - 1 : idx + 1; if (newIdx < 0 || newIdx >= section.lessons.length) return; const lessons = [...section.lessons]; [lessons[idx], lessons[newIdx]] = [lessons[newIdx], lessons[idx]]; update({ sections: draft.sections.map(s => s.id === sectionId ? { ...s, lessons } : s) }); };

  // quiz
  const addQuestion = (sectionId: string, lessonId: string) => { const lesson = draft.sections.find(s => s.id === sectionId)?.lessons.find(l => l.id === lessonId); if (!lesson) return; const questions = lesson.content.quizQuestions || []; const newQuestion: Question = { id: `q_${Date.now()}`, type: "multiple_choice", prompt: "New Question", options: ["Option 1", "Option 2"], correctAnswer: "Option 1", points: 1 }; updateLesson(sectionId, lessonId, { content: { ...lesson.content, quizQuestions: [...questions, newQuestion] } }); };
  const updateQuestion = (sectionId: string, lessonId: string, questionId: string, patch: Partial<Question>) => { const lesson = draft.sections.find(s => s.id === sectionId)?.lessons.find(l => l.id === lessonId); if (!lesson || !lesson.content.quizQuestions) return; const questions = lesson.content.quizQuestions.map(q => q.id === questionId ? { ...q, ...patch } : q); updateLesson(sectionId, lessonId, { content: { ...lesson.content, quizQuestions: questions } }); };
  const removeQuestion = (sectionId: string, lessonId: string, questionId: string) => { const lesson = draft.sections.find(s => s.id === sectionId)?.lessons.find(l => l.id === lessonId); if (!lesson || !lesson.content.quizQuestions) return; const questions = lesson.content.quizQuestions.filter(q => q.id !== questionId); updateLesson(sectionId, lessonId, { content: { ...lesson.content, quizQuestions: questions } }); };

  // pricing
  const addPriceTier = () => update({ priceTiers: [...draft.priceTiers, { id: `tier_${Date.now()}`, name: "Standard", price: 0, interval: "one_time" }] });
  const updatePriceTier = (id: string, patch: Partial<PriceTier>) => update({ priceTiers: draft.priceTiers.map(t => t.id === id ? { ...t, ...patch } : t) });
  const removePriceTier = (id: string) => update({ priceTiers: draft.priceTiers.filter(t => t.id !== id) });

  const handleSaveDraft = () => { toast.success("Draft saved!"); router.push("/teacher/courses"); };
  const handlePublish = () => { toast.success("Course published successfully!"); router.push("/teacher/courses"); };

  const steps = [
    { key: "overview", label: "Overview" },
    { key: "curriculum", label: "Curriculum" },
    { key: "pricing", label: "Pricing" },
    { key: "settings", label: "Settings" },
    { key: "publish", label: "Publish" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-3xl font-bold text-slate-900">Create New Course</h1>
            <p className="mt-1 text-sm text-slate-500">Build your course step by step</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}><Save className="mr-2 h-4 w-4" /> Save Draft</Button>
            {activeStep === "publish" ? (
              <Button onClick={handlePublish}>Publish Course</Button>
            ) : (
              <Button onClick={() => setActiveStep("publish")}>Review & Publish</Button>
            )}
          </div>
        </div>

        {/* Horizontal step tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto">
          {steps.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveStep(s.key as any)}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeStep === s.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Split layout: form left, preview right */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form area */}
          <div className="lg:col-span-2 space-y-6">
            {activeStep === "overview" && (
              <>
                {/* Basic info card */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2"><Label>Course Title *</Label><Input value={draft.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Complete Web Development Bootcamp" /></div>
                    <div className="sm:col-span-2"><Label>Subtitle</Label><Input value={draft.subtitle} onChange={(e) => update({ subtitle: e.target.value })} placeholder="A brief summary of what students will learn" /></div>
                    <div className="sm:col-span-2"><Label>Description *</Label><Textarea value={draft.description} onChange={(e) => update({ description: e.target.value })} rows={6} placeholder="Describe your course in detail..." /></div>
                    <div><Label>Category</Label><Select value={draft.category} onValueChange={(v) => update({ category: v })}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="development">Development</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="business">Business</SelectItem><SelectItem value="data-science">Data Science</SelectItem></SelectContent></Select></div>
                    <div><Label>Subcategory</Label><Input value={draft.subcategory} onChange={(e) => update({ subcategory: e.target.value })} placeholder="e.g. Web Development" /></div>
                    <div><Label>Difficulty</Label><Select value={draft.difficulty} onValueChange={(v) => update({ difficulty: v as any })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></div>
                    <div><Label>Language</Label><Select value={draft.language} onValueChange={(v) => update({ language: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="English">English</SelectItem><SelectItem value="Spanish">Spanish</SelectItem><SelectItem value="French">French</SelectItem><SelectItem value="German">German</SelectItem><SelectItem value="Bangla">Bangla</SelectItem></SelectContent></Select></div>
                  </div>
                </div>

                {/* Tags & Badge */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Tags & Badge</h2>
                  <div className="mt-4 space-y-4">
                    <div><Label>Tags</Label><div className="flex gap-2"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add a tag and press Enter" /><Button variant="outline" onClick={addTag}>Add</Button></div><div className="mt-2 flex flex-wrap gap-1.5">{draft.tags.map((tag) => <Badge key={tag} variant="secondary" className="gap-1 pr-1">{tag}<button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">×</button></Badge>)}</div></div>
                    <div><Label>{`Badge (e.g., "Best Seller", "New")`}</Label><Input value={draft.badge} onChange={(e) => update({ badge: e.target.value })} placeholder="Optional" /></div>
                  </div>
                </div>

                {/* Media */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Media</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div><Label>Thumbnail Image</Label><div className="mt-2 flex items-center gap-4"><div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50">{thumbnailPreview ? <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-slate-400" />}</div><div><input type="file" accept="image/*" onChange={handleThumbnail} className="hidden" id="thumb" /><label htmlFor="thumb"><Button variant="outline" size="sm" asChild><span>Upload</span></Button></label><p className="mt-1 text-xs text-slate-500">1280x720 recommended</p></div></div></div>
                    <div><Label>Promo Video URL (YouTube, Vimeo)</Label><Input value={draft.promoVideo} onChange={(e) => update({ promoVideo: e.target.value })} placeholder="https://youtube.com/..." /></div>
                  </div>
                </div>

                {/* Learning objectives etc. */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Learning Objectives, Requirements, Audience</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div><Label>Learning Objectives</Label><div className="flex gap-2"><Input value={objectiveInput} onChange={(e) => setObjectiveInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())} placeholder="Add objective" /><Button variant="outline" onClick={addObjective}>Add</Button></div><div className="mt-2 flex flex-wrap gap-1">{draft.learningObjectives.map((obj) => <Badge key={obj} variant="secondary" className="gap-1 pr-1">{obj}<button onClick={() => removeObjective(obj)} className="ml-1 hover:text-destructive">×</button></Badge>)}</div></div>
                    <div><Label>Requirements</Label><div className="flex gap-2"><Input value={requirementInput} onChange={(e) => setRequirementInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())} placeholder="Add requirement" /><Button variant="outline" onClick={addRequirement}>Add</Button></div><div className="mt-2 flex flex-wrap gap-1">{draft.requirements.map((req) => <Badge key={req} variant="secondary" className="gap-1 pr-1">{req}<button onClick={() => removeRequirement(req)} className="ml-1 hover:text-destructive">×</button></Badge>)}</div></div>
                    <div><Label>Audience</Label><div className="flex gap-2"><Input value={audienceInput} onChange={(e) => setAudienceInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAudience())} placeholder="Add audience" /><Button variant="outline" onClick={addAudience}>Add</Button></div><div className="mt-2 flex flex-wrap gap-1">{draft.audience.map((aud) => <Badge key={aud} variant="secondary" className="gap-1 pr-1">{aud}<button onClick={() => removeAudience(aud)} className="ml-1 hover:text-destructive">×</button></Badge>)}</div></div>
                  </div>
                </div>

                {/* SEO */}
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">SEO</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div><Label>Slug</Label><Input value={draft.slug} onChange={(e) => update({ slug: e.target.value })} placeholder="course-slug" /></div>
                    <div><Label>Meta Title</Label><Input value={draft.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} /></div>
                    <div className="sm:col-span-2"><Label>Meta Description</Label><Textarea value={draft.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} rows={2} /></div>
                  </div>
                </div>
              </>
            )}

            {activeStep === "curriculum" && (
              <>
                {/* Curriculum builder */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Course Curriculum</h2>
                  <Button onClick={addSection}><Plus className="mr-2 h-4 w-4" /> Add Section</Button>
                </div>
                {draft.sections.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center"><Layers className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm text-slate-500">No sections yet. Add a section to start building.</p></div>
                ) : (
                  <div className="space-y-4">
                    {draft.sections.map((section) => (
                      <div key={section.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        {/* Section header */}
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-slate-300 cursor-grab" />
                          <Input value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="font-medium" placeholder="Section title" />
                          <Button variant="ghost" size="icon" onClick={() => moveSection(section.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => moveSection(section.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                        {/* Lessons */}
                        <div className="mt-4 space-y-3">
                          {section.lessons.map((lesson) => (
                            <div key={lesson.id} className="rounded-lg border border-slate-200 p-3">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2 flex-1">
                                  <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                  <Input value={lesson.title} onChange={(e) => updateLesson(section.id, lesson.id, { title: e.target.value })} className="h-9" placeholder="Lesson title" />
                                  <Select value={lesson.type} onValueChange={(v) => updateLesson(section.id, lesson.id, { type: v as LessonType })}>
                                    <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">Video</SelectItem>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="quiz">Quiz</SelectItem>
                                      <SelectItem value="assignment">Assignment</SelectItem>
                                      <SelectItem value="file">File</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button variant="ghost" size="icon" onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}>
                                    {expandedLesson === lesson.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => moveLesson(section.id, lesson.id, "up")}><ArrowUp className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => moveLesson(section.id, lesson.id, "down")}><ArrowDown className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => removeLesson(section.id, lesson.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                </div>
                              </div>
                              {/* Expanded content editor */}
                              {expandedLesson === lesson.id && (
                                <div className="mt-4 space-y-4">
                                  {lesson.type === "video" && (
                                    <div className="space-y-3">
                                      <div><Label>Video URL (MP4, YouTube, Vimeo)</Label><Input value={lesson.content.videoUrl || ""} onChange={(e) => updateLesson(section.id, lesson.id, { content: { ...lesson.content, videoUrl: e.target.value } })} placeholder="https://..." /></div>
                                      <div><Label>Or Embed Code</Label><Textarea value={lesson.content.videoEmbed || ""} onChange={(e) => updateLesson(section.id, lesson.id, { content: { ...lesson.content, videoEmbed: e.target.value } })} rows={2} placeholder="<iframe ...>" /></div>
                                      <div className="flex items-center gap-4"><Label>Duration (minutes)</Label><Input type="number" value={lesson.duration || 0} onChange={(e) => updateLesson(section.id, lesson.id, { duration: Number(e.target.value) })} className="w-24" /></div>
                                    </div>
                                  )}

                                  {lesson.type === "text" && (
                                    <div><Label>Content</Label><Textarea value={lesson.content.textContent || ""} onChange={(e) => updateLesson(section.id, lesson.id, { content: { ...lesson.content, textContent: e.target.value } })} rows={6} placeholder="Write lesson content..." /></div>
                                  )}

                                  {lesson.type === "quiz" && (
                                    <div className="space-y-3">
                                      <Label>Quiz Questions</Label>
                                      {lesson.content.quizQuestions?.map((q, idx) => (
                                        <div key={q.id} className="rounded-lg border p-3 space-y-2">
                                          <div className="flex items-center justify-between"><Label>Question {idx + 1}</Label><Button variant="ghost" size="icon" onClick={() => removeQuestion(section.id, lesson.id, q.id)}><Trash2 className="h-4 w-4" /></Button></div>
                                          <Input value={q.prompt} onChange={(e) => updateQuestion(section.id, lesson.id, q.id, { prompt: e.target.value })} />
                                          <div className="flex gap-2">
                                            <Select value={q.type} onValueChange={(v) => updateQuestion(section.id, lesson.id, q.id, { type: v as QuestionType })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="multiple_choice">Multiple Choice</SelectItem><SelectItem value="true_false">True/False</SelectItem><SelectItem value="short_answer">Short Answer</SelectItem></SelectContent></Select>
                                            <Input type="number" value={q.points} onChange={(e) => updateQuestion(section.id, lesson.id, q.id, { points: Number(e.target.value) })} className="w-20" placeholder="Points" />
                                          </div>
                                          {q.type === "multiple_choice" && (
                                            <div className="space-y-2">
                                              {q.options?.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-2"><Input value={opt} onChange={(e) => { const options = [...(q.options || [])]; options[oIdx] = e.target.value; updateQuestion(section.id, lesson.id, q.id, { options }); }} /><Button variant="ghost" size="icon" onClick={() => { const options = q.options?.filter((_, i) => i !== oIdx); updateQuestion(section.id, lesson.id, q.id, { options }); }}><Trash2 className="h-4 w-4" /></Button></div>
                                              ))}
                                              <Button variant="outline" size="sm" onClick={() => updateQuestion(section.id, lesson.id, q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })}><Plus className="mr-1 h-3 w-3" /> Add Option</Button>
                                              <div className="flex items-center gap-2"><Label>Correct Answer</Label><Select value={q.correctAnswer || ""} onValueChange={(v) => updateQuestion(section.id, lesson.id, q.id, { correctAnswer: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent>{q.options?.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent></Select></div>
                                            </div>
                                          )}
                                          {q.type === "true_false" && <Select value={q.correctAnswer || ""} onValueChange={(v) => updateQuestion(section.id, lesson.id, q.id, { correctAnswer: v })}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="true">True</SelectItem><SelectItem value="false">False</SelectItem></SelectContent></Select>}
                                          {q.type === "short_answer" && <Input placeholder="Correct answer (optional)" value={q.correctAnswer || ""} onChange={(e) => updateQuestion(section.id, lesson.id, q.id, { correctAnswer: e.target.value })} />}
                                        </div>
                                      ))}
                                      <Button variant="outline" size="sm" onClick={() => addQuestion(section.id, lesson.id)}><Plus className="mr-1 h-3 w-3" /> Add Question</Button>
                                    </div>
                                  )}

                                  {lesson.type === "assignment" && <div><Label>Assignment Instructions</Label><Textarea value={lesson.content.assignmentInstructions || ""} onChange={(e) => updateLesson(section.id, lesson.id, { content: { ...lesson.content, assignmentInstructions: e.target.value } })} rows={4} placeholder="Describe what students need to submit..." /></div>}

                                  {lesson.type === "file" && <div><Label>File Upload</Label><Input type="file" onChange={(e) => { if (e.target.files?.[0]) updateLesson(section.id, lesson.id, { content: { ...lesson.content, fileUrl: URL.createObjectURL(e.target.files[0]) } }); }} /></div>}

                                  <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2"><Switch checked={lesson.freePreview} onCheckedChange={(c) => updateLesson(section.id, lesson.id, { freePreview: c })} /><Label>Free Preview</Label></div>
                                    <div className="flex items-center gap-2"><Label>Drip (days)</Label><Input type="number" min="0" value={lesson.dripDays} onChange={(e) => updateLesson(section.id, lesson.id, { dripDays: Number(e.target.value) })} className="w-20" /></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          <Button variant="ghost" size="sm" onClick={() => addLesson(section.id)}><Plus className="mr-1 h-3 w-3" /> Add Lesson</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeStep === "pricing" && (
              <>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Pricing Model</h2>
                  <div className="mt-4 space-y-4">
                    <Select value={draft.priceModel} onValueChange={(v) => update({ priceModel: v as PriceModel })}>
                      <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="onetime">One‑time Purchase</SelectItem><SelectItem value="subscription">Subscription</SelectItem></SelectContent>
                    </Select>
                    {draft.priceModel !== "free" && (
                      <div className="space-y-2">
                        <Label>Price Tiers</Label>
                        {draft.priceTiers.map((tier) => (
                          <div key={tier.id} className="flex flex-wrap items-center gap-2">
                            <Input value={tier.name} onChange={(e) => updatePriceTier(tier.id, { name: e.target.value })} className="w-32" placeholder="Tier name" />
                            <Input type="number" value={tier.price} onChange={(e) => updatePriceTier(tier.id, { price: Number(e.target.value) })} className="w-24" placeholder="Price" />
                            <Select value={tier.interval} onValueChange={(v) => updatePriceTier(tier.id, { interval: v as any })}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one_time">One‑time</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select>
                            <Button variant="ghost" size="icon" onClick={() => removePriceTier(tier.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addPriceTier}><Plus className="mr-1 h-3 w-3" /> Add Tier</Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Discounts & Enrollment</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div><Label>Discount (%)</Label><Input type="number" min="0" max="100" value={draft.discountPercent} onChange={(e) => update({ discountPercent: Number(e.target.value) })} /></div>
                    <div><Label>Coupon Code</Label><Input value={draft.couponCode} onChange={(e) => update({ couponCode: e.target.value })} /></div>
                    <div><Label>Enrollment Limit (0 = unlimited)</Label><Input type="number" min="0" value={draft.enrollmentLimit} onChange={(e) => update({ enrollmentLimit: Number(e.target.value) })} /></div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Prerequisites</h2>
                  <div className="mt-2"><Input placeholder="Comma‑separated course IDs" onChange={(e) => update({ prerequisites: e.target.value.split(",").map((s) => s.trim()) })} /></div>
                </div>
              </>
            )}

            {activeStep === "settings" && (
              <>
                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Certificate & Completion</h2>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3"><Switch checked={draft.certificateEnabled} onCheckedChange={(c) => update({ certificateEnabled: c })} /><Label>Enable certificate</Label></div>
                    {draft.certificateEnabled && <Select value={draft.certificateTemplate} onValueChange={(v) => update({ certificateTemplate: v })}><SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="default">Default Template</SelectItem><SelectItem value="modern">Modern</SelectItem><SelectItem value="classic">Classic</SelectItem></SelectContent></Select>}
                    <div><Label>Completion Criteria</Label><Select value={draft.completionCriteria} onValueChange={(v) => update({ completionCriteria: v as CompletionCriteria })}><SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="watch_all">Watch all videos</SelectItem><SelectItem value="pass_quiz">Pass all quizzes</SelectItem><SelectItem value="manual">Manual review</SelectItem></SelectContent></Select></div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Access & Integration</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div><Label>Access Duration (days, 0 = lifetime)</Label><Input type="number" min="0" value={draft.accessDuration} onChange={(e) => update({ accessDuration: Number(e.target.value) })} /></div>
                    <div><Label>Integrations (comma separated)</Label><Input placeholder="zoom, gmeet" onChange={(e) => update({ integrations: e.target.value.split(",").map((s) => s.trim()) })} /></div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Instructor Bio</h2>
                  <Textarea value={draft.instructorBio} onChange={(e) => update({ instructorBio: e.target.value })} rows={4} placeholder="Tell students about yourself..." />
                </div>
              </>
            )}

            {activeStep === "publish" && (
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Review & Publish</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <p><span className="font-medium">Title:</span> {draft.title || "—"}</p>
                  <p><span className="font-medium">Sections:</span> {draft.sections.length}</p>
                  <p><span className="font-medium">Price Model:</span> {draft.priceModel}</p>
                  <p><span className="font-medium">Status:</span> {draft.publishStatus}</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
                  <Button onClick={handlePublish}>Publish Course</Button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview (right column) */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-slate-900">Live Preview</h3>
                </div>
                <div className="p-4">
                  <div className="rounded-xl border overflow-hidden">
                    <div className="aspect-video bg-slate-100 relative">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900">{draft.title || "Course Title"}</h4>
                      <p className="text-sm text-slate-500 mt-1">{draft.subtitle || "Subtitle"}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.7</span>
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 2,145</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 84h</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-slate-900">${draft.priceTiers[0]?.price || "0.00"}</span>
                        <Badge variant="outline">{draft.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}