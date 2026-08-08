import { HomeContentForm } from '@/components/admin/home-content/home-content-form';
import { getHomeContent } from '@/lib/home-content/public';

export default async function HomeContentPage() {
  const content = await getHomeContent();

  return <HomeContentForm initialValues={content} />;
}
