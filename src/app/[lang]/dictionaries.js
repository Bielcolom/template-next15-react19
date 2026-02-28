import "server-only";
import { DEFAULT_LOCALE } from "@/utils/urls";

const BASEPATH = "./locales";
const DICTIONARY_FILES = ["common", "navbar", "home", "login", "register", "about", "products", "blog", "forgotPassword", "backoffice","table"];

const createLocaleDictionaryLoaders = (locale) =>
  Object.fromEntries(
    DICTIONARY_FILES.map((fileType) => [
       fileType,
       () => import(`${BASEPATH}/${locale}/${fileType}.json`).then((module) => module.default),
    ])
 );

const dictionaries = {
  en: createLocaleDictionaryLoaders("en"),
  es: createLocaleDictionaryLoaders("es"),
};

export const getDictionary = async (locale, fileType) => {
  const safeLocale = dictionaries[locale] ? locale : DEFAULT_LOCALE;
  const dictionary = dictionaries[safeLocale];
  return dictionary?.[fileType] ? await dictionary[fileType]() : null;
};

export const getDictionaries = async (locale, fileTypes = []) => {
  const entries = await Promise.all(
    fileTypes.map(async (fileType) => [fileType, await getDictionary(locale, fileType)])
  );

  return Object.fromEntries(entries);
};
