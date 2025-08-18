// Store configuration - should be loaded from environment or API
export const storeConfig = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || 'Bánh Mì PateDeli',
  address: {
    vi: process.env.NEXT_PUBLIC_STORE_ADDRESS_VI || '19 Võ Văn Tần, Phường Xuân Hoà, Thành Phố Hồ Chí Minh',
    en: process.env.NEXT_PUBLIC_STORE_ADDRESS_EN || '19 Võ Văn Tần, Xuân Hoà Ward, Ho Chi Minh City',
    fr: process.env.NEXT_PUBLIC_STORE_ADDRESS_FR || '19 Võ Văn Tần, Quartier Xuân Hoà, Hô-Chi-Minh-Ville',
    it: process.env.NEXT_PUBLIC_STORE_ADDRESS_IT || '19 Võ Văn Tần, Quartiere Xuân Hoà, Città di Ho Chi Minh',
    zh: process.env.NEXT_PUBLIC_STORE_ADDRESS_ZH || '19 Võ Văn Tần街, 春和坊, 胡志明市',
    ja: process.env.NEXT_PUBLIC_STORE_ADDRESS_JA || '19 Võ Văn Tần街, 春和坊, ホーチミン市',
  },
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '0909495665',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'contact@foodorder.com',
  deliveryFee: parseInt(process.env.NEXT_PUBLIC_DELIVERY_FEE || '15000'),
  deliveryRadius: parseInt(process.env.NEXT_PUBLIC_DELIVERY_RADIUS || '10'),
  minimumOrder: parseInt(process.env.NEXT_PUBLIC_MINIMUM_ORDER || '50000'),
  openingHours: {
    monday: { open: '06:00', close: '19:00', isOpen: true },
    tuesday: { open: '06:00', close: '19:00', isOpen: true },
    wednesday: { open: '06:00', close: '19:00', isOpen: true },
    thursday: { open: '06:00', close: '19:00', isOpen: true },
    friday: { open: '06:00', close: '19:00', isOpen: true },
    saturday: { open: '06:00', close: '19:00', isOpen: true },
    sunday: { open: '06:00', close: '19:00', isOpen: true },
  }
};

export type StoreConfig = typeof storeConfig;