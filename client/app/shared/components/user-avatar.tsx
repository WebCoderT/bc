type UserAvatarProps = {
  src: string;
  alt: string;
  size?: "md" | "lg";
  className?: string;
};

export function UserAvatar({
  src,
  alt,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const sizeClassName =
    size === "lg"
      ? "h-16 w-16 rounded-[var(--surface-radius-lg)]"
      : "h-11 w-11 rounded-[var(--surface-radius-md)]";

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClassName} border border-[var(--border)] bg-[var(--panel)] object-cover shadow-[var(--shadow-soft)] ${className}`.trim()}
    />
  );
}
