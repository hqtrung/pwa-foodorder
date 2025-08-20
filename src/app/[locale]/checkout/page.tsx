import { setRequestLocale } from 'next-intl/server';
import { UnifiedCheckoutPage } from '@/components/UnifiedCheckoutPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Checkout({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <UnifiedCheckoutPage />;
}

export function generateStaticParams() {
  return [
    { locale: 'vi' },
    { locale: 'en' },
    { locale: 'fr' },
    { locale: 'it' },
    { locale: 'zh' },
    { locale: 'ja' }
  ];
}