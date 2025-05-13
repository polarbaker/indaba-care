import React from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Text } from '@chakra-ui/react';
// @ts-ignore - Import Select separately to fix TypeScript errors
import { Select } from '@chakra-ui/select';
import { useTranslation } from 'next-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦' },
];

export default function LanguageSelector() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const { pathname, asPath, query } = router;

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = e.target.value;
    router.push({ pathname, query }, asPath, { locale });
  };

  return (
    <Box>
      <Select
        value={router.locale || 'en'}
        onChange={handleLanguageChange}
        variant="filled"
        size="sm"
        borderRadius="md"
        width="auto"
        maxW="150px"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </option>
        ))}
      </Select>
    </Box>
  );
}
