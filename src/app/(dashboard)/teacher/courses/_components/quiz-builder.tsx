"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Save, CheckCircle2, Sparkles } from "lucide-react";
import { useAiJob } from "@/hooks/use-ai-job";
import { toast } from "sonner";
import api from "@/lib/api";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Q {
  _id?: string;
  type: "single_choice" | "multi_choice" | "true_false" | "short_text" | "long_text";
  prompt: string;
  points: number;
  options?: QuizOption[];
  correctText?: string;
}

const uid = () => `opt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

export function QuizBuilder({
  open, onClose, courseId, sectionId, lessonId, lessonTitle,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  sectionId: string;
  lessonId: string;
  lessonTitle: string;
}) {
  const [quizId, setQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState(`${lessonTitle} Quiz`);
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { run: runAi, loading: aiLoading } = useAiJob();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (async () => {
      try {
        const r = await api.get(`/quizzes/courses/${courseId}/quizzes`);
        const quiz = (r.data.data || []).find((q: any) => q.lessonId === lessonId);
        if (quiz) {
          setQuizId(quiz._id);
          setTitle(quiz.title);
          setQuestions(
            (quiz.questions || []).map((q: any) => ({
              _id: q._id,
              type: q.type,
              prompt: q.prompt,
              points: q.points || 1,
              options: Array.isArray(q.options)
                ? q.options.map((o: any, idx: number) =>
                    typeof o === "string"
                      ? { id: `opt_${idx}`, text: o, isCorrect: false }
                      : { id: o.id || uid(), text: o.text || "", isCorrect: !!o.isCorrect }
                  )
                : [],
              correctText: q.correctText,
            }))
          );
        } else {
          setQuizId(null);
          setTitle(`${lessonTitle} Quiz`);
          setQuestions([]);
        }
      } catch {
        /* no quiz yet */
      } finally {
        setLoading(false);
      }
    })();
  }, [open, courseId, lessonId, lessonTitle]);

  const addQ = () =>
    setQuestions((qs) => [
      ...qs,
      {
        type: "single_choice",
        prompt: "New question",
        points: 1,
        options: [
          { id: uid(), text: "Option A", isCorrect: true },
          { id: uid(), text: "Option B", isCorrect: false },
        ],
      },
    ]);

  const updateQ = (i: number, patch: Partial<Q>) =>
    setQuestions((qs) => qs.map((q, ix) => (ix === i ? { ...q, ...patch } : q)));

  const removeQ = (i: number) => setQuestions((qs) => qs.filter((_, ix) => ix !== i));

  const addOption = (qi: number) => {
    const q = questions[qi];
    updateQ(qi, {
      options: [...(q.options || []), { id: uid(), text: `Option ${(q.options?.length || 0) + 1}`, isCorrect: false }],
    });
  };

  const updateOption = (qi: number, oi: number, patch: Partial<QuizOption>) => {
    const q = questions[qi];
    updateQ(qi, { options: (q.options || []).map((o, ix) => (ix === oi ? { ...o, ...patch } : o)) });
  };

  const toggleCorrect = (qi: number, oi: number) => {
    const q = questions[qi];
    if (!q.options) return;
    if (q.type === "single_choice") {
      updateQ(qi, { options: q.options.map((o, ix) => ({ ...o, isCorrect: ix === oi })) });
    } else {
      updateQ(qi, { options: q.options.map((o, ix) => (ix === oi ? { ...o, isCorrect: !o.isCorrect } : o)) });
    }
  };

  const removeOption = (qi: number, oi: number) => {
    const q = questions[qi];
    updateQ(qi, { options: (q.options || []).filter((_, ix) => ix !== oi) });
  };

  const save = async () => {
    if (!title.trim()) return toast.error("Quiz needs a title");
    if (!questions.length) return toast.error("Add at least 1 question");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) return toast.error(`Question ${i + 1}: prompt is empty`);
      if ((q.type === "single_choice" || q.type === "multi_choice") && (!q.options || q.options.length < 2)) {
        return toast.error(`Question ${i + 1}: needs at least 2 options`);
      }
      if ((q.type === "single_choice" || q.type === "multi_choice") && !q.options?.some((o) => o.isCorrect)) {
        return toast.error(`Question ${i + 1}: mark at least one correct option`);
      }
    }

    setSaving(true);
    try {
      const payload = {
        kind: "lesson_quiz",
        sectionId,
        lessonId,
        title,
        questions: questions.map((q, i) => ({
          type: q.type,
          prompt: q.prompt,
          points: q.points || 1,
          options: q.options,
          correctText: q.correctText,
          order: i,
        })),
        passingScore: 70,
        maxAttempts: 0,
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswers: "after_attempt",
        isPublished: true,
      };
      if (quizId) {
        await api.put(`/quizzes/courses/${courseId}/quizzes/${quizId}`, payload);
      } else {
        await api.post(`/quizzes/courses/${courseId}/quizzes`, payload);
      }
      toast.success("Quiz saved");
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quiz Builder — {lessonTitle}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Quiz title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 rounded-xl" />
            </div>

            {questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Question {i + 1}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-rose-500" onClick={() => removeQ(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Textarea
                  value={q.prompt}
                  onChange={(e) => updateQ(i, { prompt: e.target.value })}
                  rows={2}
                  className="mt-2 rounded-lg text-sm"
                  placeholder="Question prompt"
                />

                <div className="mt-2 flex items-center gap-2">
                  <Select value={q.type} onValueChange={(v) => updateQ(i, { type: v as Q["type"] })}>
                    <SelectTrigger className="h-9 flex-1 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_choice">Single choice</SelectItem>
                      <SelectItem value="multi_choice">Multiple choice</SelectItem>
                      <SelectItem value="true_false">True / False</SelectItem>
                      <SelectItem value="short_text">Short text</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-slate-500">Pts</Label>
                    <Input
                      type="number"
                      min={0}
                      value={q.points}
                      onChange={(e) => updateQ(i, { points: Number(e.target.value) })}
                      className="h-9 w-14 rounded-lg text-center"
                    />
                  </div>
                </div>

                {(q.type === "single_choice" || q.type === "multi_choice") && (
                  <div className="mt-3 space-y-2">
                    <Label className="text-xs">
                      Options {q.type === "single_choice" ? "(pick one)" : "(pick all correct)"}
                    </Label>
                    {(q.options || []).map((o, oi) => (
                      <div key={o.id} className="flex items-center gap-2 rounded-lg bg-slate-50 p-1.5 dark:bg-slate-800/50">
                        <input
                          type={q.type === "single_choice" ? "radio" : "checkbox"}
                          name={`q-${i}`}
                          checked={!!o.isCorrect}
                          onChange={() => toggleCorrect(i, oi)}
                          className="h-4 w-4 shrink-0 accent-indigo-600"
                        />
                        <Input
                          value={o.text}
                          onChange={(e) => updateOption(i, oi, { text: e.target.value })}
                          placeholder={`Option ${oi + 1}`}
                          className="h-8 flex-1 rounded-lg text-sm"
                        />
                        {o.isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 rounded-md text-rose-500"
                          onClick={() => removeOption(i, oi)}
                          disabled={(q.options?.length || 0) <= 2}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full rounded-lg" onClick={() => addOption(i)}>
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                    </Button>
                  </div>
                )}

                {q.type === "true_false" && (
                  <div className="mt-3">
                    <Label className="text-xs">Correct answer</Label>
                    <Select value={q.correctText || ""} onValueChange={(v) => updateQ(i, { correctText: v })}>
                      <SelectTrigger className="mt-1.5 h-9 rounded-lg"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {q.type === "short_text" && (
                  <div className="mt-3">
                    <Label className="text-xs">Correct text (exact match, case-insensitive)</Label>
                    <Input
                      value={q.correctText || ""}
                      onChange={(e) => updateQ(i, { correctText: e.target.value })}
                      placeholder="Correct answer"
                      className="mt-1.5 h-9 rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={addQ}>
                <Plus className="mr-2 h-4 w-4" /> Add question
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10"
                disabled={aiLoading}
                onClick={async () => {
                  try {
                    const job = await runAi({
                      type: "course.auto_quiz",
                      refType: "lesson",
                      refId: lessonId,
                      courseId,
                      input: { lessonId, count: 3 },
                    });

                    if (!job) {
                      toast.error("AI returned no job — check the network tab");
                      return;
                    }
                    if (job.status === "failed") {
                      toast.error(job.error || "AI job failed");
                      return;
                    }

                    const generated = job?.output?.questions || [];
                    if (!generated.length) {
                      toast.error("AI returned 0 questions — check the job output in AI Studio");
                      return;
                    }

                    const normalized: Q[] = generated.map((q: any) => ({
                      type: q.type || "single_choice",
                      prompt: q.prompt || "",
                      points: q.points || 1,
                      options: Array.isArray(q.options)
                        ? q.options.map((o: any, i: number) => ({
                            id: o.id || `opt_${Date.now()}_${i}`,
                            text: o.text || "",
                            isCorrect: !!o.isCorrect,
                          }))
                        : undefined,
                      correctText: q.correctText,
                    }));
                    setQuestions((prev) => [...prev, ...normalized]);
                    toast.success(`Added ${normalized.length} AI-generated question${normalized.length === 1 ? "" : "s"}`);
                  } catch (err: any) {
                    // toast already shown by hook, but log the full error for debugging
                    console.error("[QuizBuilder] AI generation failed:", err?.response?.data || err);
                  }
                }}
              >
                {aiLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI Generate 3 questions
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-xl" onClick={onClose}>Cancel</Button>
              <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}