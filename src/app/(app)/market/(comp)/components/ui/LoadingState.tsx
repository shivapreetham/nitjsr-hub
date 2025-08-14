import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';
import { LoadingStateProps } from "../types";

export default function LoadingState({ message = "Loading products..." }: LoadingStateProps) {
  return <SharedLoadingScreen message={message} overlay={false} />;
} 