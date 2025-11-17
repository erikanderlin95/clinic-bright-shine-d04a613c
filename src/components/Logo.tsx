import { Calendar } from "lucide-react";

interface LogoProps {
  showTagline?: boolean;
  className?: string;
}

export const Logo = ({ showTagline = true, className = "" }: LogoProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="bg-primary rounded-xl p-2.5 shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">Clynic</span>
          <span className="text-2xl font-bold text-primary">Q</span>
        </div>
        {showTagline && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            QUEUE • BOOK • CONNECT
          </span>
        )}
      </div>
    </div>
  );
};
