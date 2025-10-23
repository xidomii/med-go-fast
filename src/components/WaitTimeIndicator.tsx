import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface WaitTimeIndicatorProps {
  waitTime: number; // in minutes
  size?: "sm" | "md" | "lg";
}

const WaitTimeIndicator = ({ waitTime, size = "md" }: WaitTimeIndicatorProps) => {
  const getVariant = () => {
    if (waitTime <= 15) return "success";
    if (waitTime <= 30) return "warning";
    return "destructive";
  };

  const getLabel = () => {
    if (waitTime <= 15) return "Kurze Wartezeit";
    if (waitTime <= 30) return "Mittlere Wartezeit";
    return "Lange Wartezeit";
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge variant={getVariant()} className={sizeClasses[size]}>
      <Clock className="w-3 h-3 mr-1" />
      {waitTime} Min. • {getLabel()}
    </Badge>
  );
};

export default WaitTimeIndicator;
