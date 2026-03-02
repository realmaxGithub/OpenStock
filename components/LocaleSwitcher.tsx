'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { routing } from '@/i18n/routing';

const localeNames: Record<string, string> = {
  en: 'English',
  'zh-TW': '台灣繁體',
  'zh-HK': '香港繁體',
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname?.split('/') ?? [];
    if (routing.locales.includes(segments[1] as 'en' | 'zh-TW' | 'zh-HK')) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    window.location.href = segments.join('/') || `/${newLocale}`;
  };

  return (
    <Select value={locale} onValueChange={switchLocale}>
      <SelectTrigger className="w-[130px] h-9 border-gray-600 bg-gray-800 text-gray-400 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc] ?? loc}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
