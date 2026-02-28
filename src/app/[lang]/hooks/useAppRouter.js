"use client";

import { usePathname, useRouter } from "next/navigation";
import { buildLocalizedNavigation } from "@/utils/navigation";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const navigation = buildLocalizedNavigation(pathname);

  return {
    locale: navigation.locale,
    pathname,
    pathnameWithoutLocale: navigation.pathnameWithoutLocale,
    push: (path, options) => router.push(navigation.localizePath(path), options),
    replace: (path, options) => router.replace(navigation.localizePath(path), options),
    switchLocale: (nextLocale) => router.push(navigation.switchLocalePath(nextLocale)),
  };
};
