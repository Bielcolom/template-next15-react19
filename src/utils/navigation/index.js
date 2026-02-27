import { getLocaleFromPath, stripLocaleFromPath, withLocalePath } from "../helpers";

export const buildLocalizedNavigation = (pathname) => {
  const locale = getLocaleFromPath(pathname) || "es";
  const pathnameWithoutLocale = stripLocaleFromPath(pathname);

  return {
    locale,
    pathnameWithoutLocale,
    localizePath: (path) => withLocalePath(path, locale),
    switchLocalePath: (nextLocale) => withLocalePath(pathnameWithoutLocale, nextLocale),
  };
};
