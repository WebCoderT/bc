"use client";

import {
  useEffect,
  useId,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";

type ModalShellProps = PropsWithChildren<{
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  headerContent?: ReactNode;
  closeText?: string;
  maxWidthClassName?: string;
  zIndexClassName?: string;
  overlayClassName?: string;
  panelClassName?: string;
  bodyClassName?: string;
  headerClassName?: string;
  showCloseButton?: boolean;
}>;

export function ModalShell({
  title,
  description,
  onClose,
  children,
  footer,
  headerContent,
  closeText = "关闭",
  maxWidthClassName = "max-w-2xl",
  zIndexClassName = "z-50",
  overlayClassName,
  panelClassName,
  bodyClassName,
  headerClassName,
  showCloseButton = true,
}: ModalShellProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm",
        zIndexClassName,
        overlayClassName,
      )}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            "flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-modal)]",
            maxWidthClassName,
            panelClassName,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className={cn(
              "bg-[linear-gradient(135deg,var(--accent),var(--accent-strong))] px-6 py-6 text-white",
              headerClassName,
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {headerContent}
                <h3 id={titleId} className="text-2xl font-semibold">
                  {title}
                </h3>
                {description ? (
                  <p id={descriptionId} className="mt-2 text-sm text-white/80">
                    {description}
                  </p>
                ) : null}
              </div>

              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
                >
                  {closeText}
                </button>
              ) : null}
            </div>
          </div>

          <div className={cn("overflow-y-auto p-6", bodyClassName)}>
            {children}
          </div>

          {footer ? (
            <div className="border-t border-[var(--border)] px-6 py-5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
