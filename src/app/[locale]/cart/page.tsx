import { CartPage } from '@/components/CartPage';
import { setRequestLocale } from 'next-intl/server';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Cart({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <CartPage />;
}