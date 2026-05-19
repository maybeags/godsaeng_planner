import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileAvatar({
  src,
  alt,
  size = "lg",
  className,
}: {
  src?: string | null;
  alt?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  const dim =
    size === "xl" ? "size-24" : size === "lg" ? "size-16" : "size-10";
  const iconDim =
    size === "xl" ? "size-10" : size === "lg" ? "size-7" : "size-5";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted",
        dim,
        className
      )}
    >
      {src ? (
        // 외부(카카오) 이미지 — Next/Image 도메인 등록 없이 쓰기 위해 <img>
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? "프로필"}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <User className={cn("text-muted-foreground", iconDim)} />
      )}
    </div>
  );
}
