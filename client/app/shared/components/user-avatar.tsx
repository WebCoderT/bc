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
    size === "lg" ? "h-20 w-20 rounded-[1.8rem]" : "h-12 w-12 rounded-2xl";

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClassName} border border-[var(--border)] bg-[var(--panel)] object-cover shadow-[0_18px_40px_var(--glow)] ${className}`.trim()}
    />
  );
}