import PropTypes from "prop-types";
import { getTranslations } from "next-intl/server";

export default async function ProductLayout({ children, params }) {
    const { lang } = await params;
    const t = await getTranslations({ locale: lang, namespace: "products" });

    return (
        <div>
            {children}
            <h2>{t("featuredSectionTitle")}</h2>
        </div>
    );
}

ProductLayout.propTypes = {
    children: PropTypes.node.isRequired,
    params: PropTypes.object.isRequired,
};
