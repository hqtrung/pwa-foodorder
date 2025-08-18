import { setRequestLocale } from 'next-intl/server';
import { OrderTrackingPage } from '@/components/OrderTrackingPage';

interface PageProps {
  params: Promise<{ locale: string; orderId: string }>;
}

export default async function OrderTracking({ params }: PageProps) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);
  
  return <OrderTrackingPage orderId={orderId} />;
}

export function generateStaticParams() {
  // For dynamic order tracking pages, we can't pre-generate all possible order IDs
  // Return empty array to force dynamic rendering for this route
  return [];
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;