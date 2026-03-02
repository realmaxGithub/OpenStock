'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const LOCALES = ['en', 'zh-TW', 'zh-HK'];

export default function LocaleLang() {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1] ?? '';
  const locale = LOCALES.includes(segment) ? segment : 'en';

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
