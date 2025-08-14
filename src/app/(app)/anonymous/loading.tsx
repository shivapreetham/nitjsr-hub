import TheOneLoader from '@/components/shared/TheOneLoader';

export default function AnonymousLoading() {
  return (
    <TheOneLoader 
      overlay={false}
      showJoke={true}
      className="min-h-[50vh]"
    />
  );
}