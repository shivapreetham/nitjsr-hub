import TheOneLoader from '@/components/shared/TheOneLoader';

const loading = () => {
  return (
    <TheOneLoader 
      overlay={false}
      showJoke={true}
      className="h-full"
    />
  );
};

export default loading;
