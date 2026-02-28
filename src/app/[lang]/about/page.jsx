import { getTranslations } from "next-intl/server";
import AppLink from "../components/base/AppLink";
import { INDEX_URL } from "@/utils/urls";

export default async function About({ params }) {
    const { lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: "about" });

    return (
        <>
            <h1>{t("title")}</h1>
            <AppLink href={INDEX_URL}>{t("backHome")}</AppLink>
        </>
    );
}
