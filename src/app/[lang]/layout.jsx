import PropTypes from "prop-types";
import { Fraunces, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.scss";
import { getCurrentSession } from "../lib/session";
import { SessionProvider } from "../context/sessionProvider";
import { ToastProvider } from "../context/toastProvider";
import PageWrapper from "./components/PageWrapper";
import ErrorBoundary from "./components/ErrorBoundary";
import { hasLocale } from "@/utils/urls";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Colom Code Studio",
  description: "Dando vida a tu presencia digital.",
};

export default async function LocaleLayout({ children, params }) {
  const { lang } = await params;

  if (!hasLocale(lang)) {
    notFound();
  }

  setRequestLocale(lang);

  const session = await getCurrentSession();
  const userId = session?.userId || null;
  const permissions = session?.permissions || [];

  return (
    <html lang={lang} className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <NextIntlClientProvider>
          <ErrorBoundary>
            <ToastProvider>
              <SessionProvider permissions={permissions} userId={userId}>
                <PageWrapper>{children}</PageWrapper>
              </SessionProvider>
            </ToastProvider>
          </ErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

LocaleLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
