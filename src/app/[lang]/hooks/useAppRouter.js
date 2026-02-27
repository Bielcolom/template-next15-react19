"use client";

import { usePathname, useRouter } from "next/navigation";
import { getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "@/utils/helpers";

export const useAppRouter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname) || "es";
  const pathnameWithoutLocale = stripLocaleFromPath(pathname);

  const localize = (path) => withLocalePath(path, locale);

  return {
    locale,
    pathname,
    pathnameWithoutLocale,
    push: (path, options) => router.push(localize(path), options),
    replace: (path, options) => router.replace(localize(path), options),
    switchLocale: (nextLocale) =>
      router.push(withLocalePath(pathnameWithoutLocale, nextLocale)),
  };
};
