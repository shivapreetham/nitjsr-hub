import TheOneLoader from '@/components/shared/TheOneLoader';

export default function VideoLoading() {
  return (
    <TheOneLoader 
      overlay={false}
      showJoke={true}
      className="min-h-[50vh]"
    />
  );
}