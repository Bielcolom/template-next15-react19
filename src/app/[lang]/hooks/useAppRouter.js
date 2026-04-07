"use client";

import { useMemo } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return useMemo(() => ({
    locale,
    pathname,
    pathnameWithoutLocale: pathname,
    push: (path, options) => router.push(path, options),
    replace: (path, options) => router.replace(path, options),
    switchLocale: (nextLocale) => router.replace(pathname, { locale: nextLocale }),
  }), [locale, pathname, router]);
};
