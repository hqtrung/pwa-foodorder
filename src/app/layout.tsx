import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FoodOrder - Vietnamese Restaurant',
  description: 'Order delicious Vietnamese food for table service or delivery',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}