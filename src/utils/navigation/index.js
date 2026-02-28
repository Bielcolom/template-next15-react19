import { getLocaleFromPath, stripLocaleFromPath, getLocalizedPath } from "../urls";

export const buildLocalizedNavigation = (pathname) => {
  const locale = getLocaleFromPath(pathname) || "es";
  const pathnameWithoutLocale = stripLocaleFromPath(pathname);

  return {
    locale,
    pathnameWithoutLocale,
    localizePath: (path) => getLocalizedPath(path, locale),
    switchLocalePath: (nextLocale) => getLocalizedPath(pathnameWithoutLocale, nextLocale),
  };
};
