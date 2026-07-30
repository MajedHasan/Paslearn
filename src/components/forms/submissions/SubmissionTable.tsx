"use client";

import Link from "next/link";

type SubmissionRow = {
  _id: string;
  resourceKey: string;
  values: Record<string, any>;
  status: string;
  createdAt: string;
};

export default function SubmissionTable({ items }: { items: SubmissionRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Resource</th>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-t">
              <td className="px-4 py-3 font-medium">{item.resourceKey}</td>
              <td className="px-4 py-3">
                <pre className="max-w-xl overflow-auto rounded-xl bg-slate-50 p-3 text-xs">
                  {JSON.stringify(item.values, null, 2)}
                </pre>
              </td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/submissions/${item._id}`}
                  className="font-semibold text-[#D4A017]"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
