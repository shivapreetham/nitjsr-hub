import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

const loading = () => {
  return <SharedLoadingScreen message="Loading conversations..." overlay={false} />;
};
export default loading;
