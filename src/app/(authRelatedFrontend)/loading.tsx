import TheOneLoader from '@/components/shared/TheOneLoader';

export default function AuthLoading() {
  return (
    <TheOneLoader 
      overlay={false}
      showJoke={true}
      className="min-h-screen"
    />
  );
}