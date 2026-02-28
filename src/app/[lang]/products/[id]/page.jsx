import PropTypes from "prop-types";
import { getDictionary } from "../../dictionaries";

export default async function Product({ params }) {
    const { id, lang } = await params;
    const dictionary = await getDictionary(lang, "products");

    return (
        <>
            <h1>{dictionary?.detailTitlePrefix}: {id}</h1>
        </>
    );
}

Product.propTypes = {
    params: PropTypes.object.isRequired,
};
