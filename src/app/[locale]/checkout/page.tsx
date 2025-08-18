import { setRequestLocale } from 'next-intl/server';
import { CheckoutPageMobile } from '@/components/CheckoutPageMobile';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Checkout({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <CheckoutPageMobile />;
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