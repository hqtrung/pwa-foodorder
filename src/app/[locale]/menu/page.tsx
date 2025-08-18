import { MenuPage } from '@/components/MenuPage';
import { setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Menu({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <MenuPage />;
}