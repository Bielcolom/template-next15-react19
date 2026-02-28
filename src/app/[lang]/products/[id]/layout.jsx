import PropTypes from "prop-types";
import { getDictionary } from "../../dictionaries";

export default async function ProductLayout({ children, params }) {
    const { lang } = await params;
    const dictionary = await getDictionary(lang, "products");

    return (
        <div>
            {children}
            <h2>{dictionary?.featuredSectionTitle}</h2>
        </div>
    );
}

ProductLayout.propTypes = {
    children: PropTypes.node.isRequired,
    params: PropTypes.object.isRequired,
};
