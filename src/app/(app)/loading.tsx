import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

export default function AppLoading() {
  return <SharedLoadingScreen message="Loading application..." overlay={false} />;
}