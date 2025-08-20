import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ModalProvider } from '@/components/providers/ModalProvider';
import { CacheProvider } from '@/components/providers/CacheProvider';
import { TranslationProvider } from '@/components/providers/TranslationProvider';
import { FloatingOrderStatus } from '@/components/ui/FloatingOrderStatus';
import "../globals.css";

// Inter for Latin scripts (English, French, Italian)
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

// Be Vietnam Pro for Vietnamese
const beVietnamPro = localFont({
  src: [
    {
      path: '../../../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/be-vietnam-pro/files/be-vietnam-pro-latin-600-normal.woff2',
      weight: '600',
      style: 'normal',
    }
  ],
  variable: '--font-be-vietnam-pro',
  fallback: ['system-ui', 'sans-serif'],
});

// Noto Sans for Chinese and Japanese
const notoSans = localFont({
  src: [
    {
      path: '../../../node_modules/@fontsource/noto-sans-sc/files/noto-sans-sc-chinese-simplified-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff2',
      weight: '400',
      style: 'normal',
    }
  ],
  variable: '--font-noto-sans',
  fallback: ['system-ui', 'sans-serif'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${beVietnamPro.variable} ${notoSans.variable}`}>
      <head>
        <meta name="application-name" content="FoodOrder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FoodOrder" />
        <meta name="description" content="Order delicious Vietnamese food for table service or delivery" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#F97316" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#F97316" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-152x152.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="mask-icon" href="/icons/icon-base.svg" color="#F97316" />
        <link rel="shortcut icon" href="/icons/icon-72x72.png" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://yoursite.com" />
        <meta name="twitter:title" content="FoodOrder" />
        <meta name="twitter:description" content="Order delicious Vietnamese food for table service or delivery" />
        <meta name="twitter:image" content="https://yoursite.com/icons/icon-192x192.png" />
        <meta name="twitter:creator" content="@yourhandle" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="FoodOrder" />
        <meta property="og:description" content="Order delicious Vietnamese food for table service or delivery" />
        <meta property="og:site_name" content="FoodOrder" />
        <meta property="og:url" content="https://yoursite.com" />
        <meta property="og:image" content="https://yoursite.com/icons/icon-192x192.png" />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <TranslationProvider>
            {children}
            <FloatingOrderStatus />
            <ToastProvider />
            <ModalProvider />
          </TranslationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
