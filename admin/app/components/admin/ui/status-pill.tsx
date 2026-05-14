import { getStatusClass } from "@/app/utils/admin-format";

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusClass(status)}`}
    >
      {status}
    </span>
  );
}
