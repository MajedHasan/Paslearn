"use client";

export default function SubmissionDetails({
  item,
}: {
  item: {
    _id: string;
    resourceKey: string;
    values: Record<string, any>;
    meta: Record<string, any>;
    status: string;
    notes?: string;
    createdAt: string;
  };
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-bold text-slate-900">Submission</h2>
        <p className="mt-2 text-sm text-slate-600">{item.resourceKey}</p>
        <p className="mt-1 text-sm text-slate-500">
          {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Values</h3>
          <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-4 text-xs">
            {JSON.stringify(item.values, null, 2)}
          </pre>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Meta</h3>
          <pre className="mt-4 overflow-auto rounded-xl bg-slate-50 p-4 text-xs">
            {JSON.stringify(item.meta, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
