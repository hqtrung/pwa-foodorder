import { setRequestLocale } from 'next-intl/server';
import { OrderCompletedPage } from '@/components/OrderCompletedPage';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderCompleted({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { orderId } = await searchParams;
  setRequestLocale(locale);
  
  return <OrderCompletedPage orderId={orderId} />;
}

export const dynamic = 'force-dynamic';