import PropTypes from "prop-types";
import { getTranslations } from "next-intl/server";

export default async function Product({ params }) {
    const { id, lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: "products" });

    return (
        <>
            <h1>{t("detailTitlePrefix")}: {id}</h1>
        </>
    );
}

Product.propTypes = {
    params: PropTypes.object.isRequired,
};
