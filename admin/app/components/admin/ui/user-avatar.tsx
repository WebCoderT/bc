"use client";

export function UserAvatar({
  src,
  alt,
  size = "md",
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClassName = {
    sm: "h-10 w-10 rounded-xl",
    md: "h-12 w-12 rounded-2xl",
    lg: "h-20 w-20 rounded-[1.4rem]",
  }[size];

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClassName} shrink-0 border border-slate-200 bg-slate-100 object-cover shadow-sm`}
    />
  );
}