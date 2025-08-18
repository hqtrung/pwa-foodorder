import { setRequestLocale } from 'next-intl/server';
import { StaffDashboard } from '@/components/StaffDashboard';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Staff({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  
  return <StaffDashboard />;
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