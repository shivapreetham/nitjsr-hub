import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

export default function AnonymousLoading() {
  return <SharedLoadingScreen message="Loading anonymous messages..." overlay={false} />;
}