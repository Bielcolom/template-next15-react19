import { getRequestConfig } from "next-intl/server";
import { loadMessages, getSafeLocale } from "./messages";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const resolvedRequestLocale = locale || await requestLocale;
  const safeLocale = getSafeLocale(resolvedRequestLocale);

  return {
    locale: safeLocale,
    messages: await loadMessages(safeLocale),
  };
});
