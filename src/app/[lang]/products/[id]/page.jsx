import PropTypes from "prop-types";

export default async function Product({ params }) {
    const { id } = params;
    return (
        <>  
            <h1>Product: {id}</h1> 
        </>
    );
}

Product.propTypes = {
    params: PropTypes.object.isRequired,
};