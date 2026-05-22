"use client";

import { useState } from "react";
import { ModalShell } from "@/app/components/admin/ui/modal-shell";

type ConfigDetailTriggerProps = {
  summary: string;
  detail: string;
  title: string;
  description: string;
};

export function ConfigDetailTrigger({
  summary,
  detail,
  title,
  description,
}: ConfigDetailTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(detail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <div className="min-w-0">
        <p className="truncate">{summary}</p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-1 text-xs text-slate-400 transition hover:text-slate-600"
        >
          查看详情
        </button>
      </div>

      {isOpen ? (
        <ModalShell
          title={title}
          description={description}
          onClose={() => setIsOpen(false)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">配置内容</p>
              <button
                type="button"
                onClick={() => {
                  void handleCopy();
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                {copied ? "已复制" : "复制内容"}
              </button>
            </div>

            <pre className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-6 text-slate-700">
              {detail}
            </pre>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
