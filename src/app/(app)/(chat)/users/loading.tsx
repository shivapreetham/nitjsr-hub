import SharedLoadingScreen from '@/components/shared/SharedLoadingScreen';

const loading = () => {
  return <SharedLoadingScreen message="Loading users..." overlay={false} />;
};
export default loading;
