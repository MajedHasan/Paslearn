"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Sparkles, Loader2, Tags, ListChecks, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAiJob, FAKE_REF_ID } from "@/hooks/use-ai-job";

// ─────────────────────────────────────────────────────────────
// Description suggest — shows dialog with 3 suggestions
// ─────────────────────────────────────────────────────────────
export function AiDescriptionSuggest({
  title,
  category,
  courseId,
  onApply,
}: {
  title: string;
  category?: string;
  courseId?: string;
  onApply: (description: string) => void;
}) {
  const { run, loading } = useAiJob();
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleRun = async () => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }
    try {
      const job = await run({
        type: "course.description_suggest",
        refType: "course",
        refId: courseId || FAKE_REF_ID,
        courseId,
        input: { title, category },
      });
      const list: string[] = job?.output?.suggestions || [];
      if (list.length === 0) {
        toast.error("No suggestions returned");
        return;
      }
      setSuggestions(list);
      setOpen(true);
    } catch {
      /* toast already shown */
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-lg border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10"
        onClick={handleRun}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
        )}
        AI Suggest
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-600" />
              AI Suggested Descriptions
            </DialogTitle>
            <DialogDescription>
              Pick one to use. You can edit it afterward.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  onApply(s);
                  setOpen(false);
                  toast.success("Description applied");
                }}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-500/40 dark:hover:bg-violet-500/10"
              >
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
                  <span>{s}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Tag suggest — merges generated tags into the current list
// ─────────────────────────────────────────────────────────────
export function AiTagSuggest({
  title,
  description,
  existingTags,
  courseId,
  onApply,
}: {
  title: string;
  description: string;
  existingTags: string[];
  courseId?: string;
  onApply: (tags: string[]) => void;
}) {
  const { run, loading } = useAiJob();

  const handleRun = async () => {
    if (!title.trim()) {
      toast.error("Add a title first");
      return;
    }
    try {
      const job = await run({
        type: "course.tag_suggest",
        refType: "course",
        refId: courseId || FAKE_REF_ID,
        courseId,
        input: { title, description },
      });
      const suggested: string[] = job?.output?.tags || [];
      const newTags = suggested.filter((t) => !existingTags.includes(t));
      if (newTags.length === 0) {
        toast.info("No new tags to add");
        return;
      }
      onApply(newTags);
      toast.success(`Added ${newTags.length} tag${newTags.length === 1 ? "" : "s"}`);
    } catch {
      /* toast shown */
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="rounded-lg border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10"
      onClick={handleRun}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Tags className="mr-1.5 h-3.5 w-3.5" />
      )}
      AI Tags
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────
// Course outline generator — builds sections from a topic
// ─────────────────────────────────────────────────────────────
export function AiGenerateOutline({
  topic,
  level,
  courseId,
  onApply,
}: {
  topic: string;
  level: string;
  courseId?: string;
  onApply: (sections: any[]) => void;
}) {
  const { run, loading } = useAiJob();
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState<any[]>([]);

  const handleRun = async () => {
    if (!topic.trim()) {
      toast.error("Add a course title first");
      return;
    }
    try {
      const job = await run({
        type: "course.outline",
        refType: "course",
        refId: courseId || FAKE_REF_ID,
        courseId,
        input: { topic, level, lessonCount: 3 },
      });
      const list: any[] = job?.output?.sections || [];
      if (list.length === 0) {
        toast.error("No outline generated");
        return;
      }
      setSections(list);
      setOpen(true);
    } catch {
      /* toast shown */
    }
  };

  const totalLessons = sections.reduce((a, s) => a + (s.lessons?.length || 0), 0);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="rounded-xl border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-violet-500/30 dark:text-violet-400 dark:hover:bg-violet-500/10"
        onClick={handleRun}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ListChecks className="mr-2 h-4 w-4" />
        )}
        AI Generate Outline
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-violet-600" />
              Generated Outline
            </DialogTitle>
            <DialogDescription>
              {sections.length} section{sections.length === 1 ? "" : "s"} ·{" "}
              {totalLessons} lesson{totalLessons === 1 ? "" : "s"}. Add them to your curriculum?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {sections.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{s.title}</p>
                <ul className="mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {(s.lessons || []).map((l: any, j: number) => (
                    <li key={j} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400" />
                      {l.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-violet-600 hover:bg-violet-700"
              onClick={() => {
                onApply(sections);
                setOpen(false);
                toast.success(`Added ${sections.length} section(s)`);
              }}
            >
              <Check className="mr-2 h-4 w-4" /> Add to curriculum
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}