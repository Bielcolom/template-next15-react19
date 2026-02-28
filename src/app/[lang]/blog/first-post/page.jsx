import { getTranslations } from "next-intl/server";

export default async function FirstPost({ params }) {
    const { lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: "blog" });

    return <><h1>{t("firstPostTitle")}</h1></>;
}
