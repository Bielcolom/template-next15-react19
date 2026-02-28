import { getTranslations } from "next-intl/server";

export default async function ForgotPassword({ params }) {
    const { lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: "forgotPassword" });

    return <><h1>{t("title")}</h1></>;
}
