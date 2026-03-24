import { cn } from "@/lib/utils";
import { useSiteContent } from "@/content/siteContent";

interface LogoMarkProps {
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 rounded-lg text-sm",
  md: "w-10 h-10 rounded-lg text-lg",
};

const imageSizes = {
  sm: "w-8 h-8 rounded-full",
  md: "w-10 h-10 rounded-full",
};

const LogoMark = ({ size = "md", className }: LogoMarkProps) => {
  const { content } = useSiteContent();

  if (content.branding.logoImage) {
    return (
      <img
        src={content.branding.logoImage}
        alt={content.branding.siteName}
        className={cn(imageSizes[size], "bg-white object-contain p-0.5", className)}
      />
    );
  }

  return (
    <div className={cn(sizeClasses[size], "bg-primary flex items-center justify-center", className)}>
      <span className="text-primary-foreground font-heading font-bold">{content.branding.logoText || "K"}</span>
    </div>
  );
};

export default LogoMark;
