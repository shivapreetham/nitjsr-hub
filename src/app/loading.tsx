import TheOneLoader from '@/components/shared/TheOneLoader';

export default function Loading() {
  return (
    <TheOneLoader 
      overlay={false}
      size={40}
      showJoke={true}
      className="min-h-screen bg-background"
    />
  );
}