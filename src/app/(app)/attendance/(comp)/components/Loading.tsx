import TheOneLoader from '@/components/shared/TheOneLoader';

export default function Loading() {
  return (
    <TheOneLoader 
      overlay={false} 
      showJoke={true}
      className="min-h-[50vh]"
    />
  );
} 