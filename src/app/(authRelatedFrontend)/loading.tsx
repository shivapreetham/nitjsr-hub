import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

export default function AuthLoading() {
  return <SharedLoadingScreen message="Loading authentication..." overlay={false} />;
}