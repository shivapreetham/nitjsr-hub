import TheOneLoader from '@/components/shared/TheOneLoader';

export default function AppLoading() {
  return (
    <TheOneLoader 
      overlay={false}
      size={36}
      showJoke={true}
      className="min-h-[60vh]"
    />
  );
}