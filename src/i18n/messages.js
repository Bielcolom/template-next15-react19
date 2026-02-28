import "server-only";
import { DEFAULT_LOCALE, hasLocale } from "@/utils/urls";

const messageLoaders = {
  en: {
    common: () => import("../app/[lang]/locales/en/common.json").then((module) => module.default),
    navbar: () => import("../app/[lang]/locales/en/navbar.json").then((module) => module.default),
    home: () => import("../app/[lang]/locales/en/home.json").then((module) => module.default),
    login: () => import("../app/[lang]/locales/en/login.json").then((module) => module.default),
    register: () => import("../app/[lang]/locales/en/register.json").then((module) => module.default),
    about: () => import("../app/[lang]/locales/en/about.json").then((module) => module.default),
    products: () => import("../app/[lang]/locales/en/products.json").then((module) => module.default),
    blog: () => import("../app/[lang]/locales/en/blog.json").then((module) => module.default),
    forgotPassword: () => import("../app/[lang]/locales/en/forgotPassword.json").then((module) => module.default),
    backoffice: () => import("../app/[lang]/locales/en/backoffice.json").then((module) => module.default),
    table: () => import("../app/[lang]/locales/en/table.json").then((module) => module.default),
  },
  es: {
    common: () => import("../app/[lang]/locales/es/common.json").then((module) => module.default),
    navbar: () => import("../app/[lang]/locales/es/navbar.json").then((module) => module.default),
    home: () => import("../app/[lang]/locales/es/home.json").then((module) => module.default),
    login: () => import("../app/[lang]/locales/es/login.json").then((module) => module.default),
    register: () => import("../app/[lang]/locales/es/register.json").then((module) => module.default),
    about: () => import("../app/[lang]/locales/es/about.json").then((module) => module.default),
    products: () => import("../app/[lang]/locales/es/products.json").then((module) => module.default),
    blog: () => import("../app/[lang]/locales/es/blog.json").then((module) => module.default),
    forgotPassword: () => import("../app/[lang]/locales/es/forgotPassword.json").then((module) => module.default),
    backoffice: () => import("../app/[lang]/locales/es/backoffice.json").then((module) => module.default),
    table: () => import("../app/[lang]/locales/es/table.json").then((module) => module.default),
  },
};

export const getSafeLocale = (locale) => (hasLocale(locale) ? locale : DEFAULT_LOCALE);

export const loadNamespace = async (locale, namespace) => {
  const safeLocale = getSafeLocale(locale);
  const loader = messageLoaders[safeLocale]?.[namespace];

  return loader ? await loader() : null;
};

export const loadMessages = async (locale) => {
  const safeLocale = getSafeLocale(locale);
  const loaders = messageLoaders[safeLocale];

  const entries = await Promise.all(
    Object.entries(loaders).map(async ([namespace, loader]) => [namespace, await loader()])
  );

  return Object.fromEntries(entries);
};
