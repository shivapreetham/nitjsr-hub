import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

export default function MeetingLoading() {
  return <SharedLoadingScreen message="Joining meeting..." overlay={false} />;
}