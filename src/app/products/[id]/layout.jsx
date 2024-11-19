import PropTypes from "prop-types";

export default function ProductLayout({ children }) {
    return( 
        <div>
            {children}
            <h2>featured products section</h2>
        </div>
    );
}

ProductLayout.propTypes = {
    children: PropTypes.node.isRequired,
};