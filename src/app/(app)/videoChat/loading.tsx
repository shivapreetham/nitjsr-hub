import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

export default function VideoLoading() {
  return <SharedLoadingScreen message="Setting up video chat..." overlay={false} />;
}