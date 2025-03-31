import { cn } from "@/lib/utils";
import logoPath from "@assets/yourProductivityHub.png";

type LogoSize = "small" | "medium" | "large";

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const sizeMap = {
  small: "h-8 w-8",
  medium: "h-10 w-10",
  large: "h-12 w-12",
};

export function Logo({ size = "medium", className }: LogoProps) {
  return (
    <img 
      src={logoPath} 
      alt="ProductivityHub Logo" 
      className={cn(sizeMap[size], "rounded-md", className)}
    />
  );
}

interface LogoWithTextProps {
  size?: LogoSize;
  className?: string;
}

const textSizeMap = {
  small: "text-lg",
  medium: "text-xl",
  large: "text-2xl",
};

export function LogoWithText({ size = "medium", className }: LogoWithTextProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <Logo size={size} />
      <div className={cn("ml-2 font-semibold text-gray-800", textSizeMap[size])}>
        <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Productivity
        </span>
        <span>Hub</span>
      </div>
    </div>
  );
}