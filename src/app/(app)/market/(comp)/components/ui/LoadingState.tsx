import TheOneLoader from '@/components/shared/TheOneLoader';
import { LoadingStateProps } from "../types";

export default function LoadingState({ message }: LoadingStateProps) {
  return (
    <TheOneLoader 
      overlay={false}
      message={message}
      showJoke={!message}
      className="min-h-[50vh]"
    />
  );
} 