import { Loader2 } from "lucide-react";
import { LoadingStateProps } from "../types";

export default function LoadingState({ message = "Loading products..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 glass-card">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="mt-4 text-blue-600">{message}</p>
    </div>
  );
} 