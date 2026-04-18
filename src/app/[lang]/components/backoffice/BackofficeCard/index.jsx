// handoff/src/app/[lang]/components/backoffice/BackofficeCard/index.jsx
// Actualizado para soportar icono + layout con header.

import PropTypes from "prop-types";
import styles from "./backofficeCard.module.scss";

const BackofficeCard = ({ text, number, icon }) => {
    return (
        <div className={styles.backofficeClient}>
            <div className={styles.header}>
                <span className={styles.text}>{text}</span>
                {icon && <span className={styles.icon}>{icon}</span>}
            </div>
            <span className={styles.number}>{number}</span>
        </div>
    );
};

BackofficeCard.propTypes = {
    text: PropTypes.string.isRequired,
    number: PropTypes.number,
    icon: PropTypes.node,
};

BackofficeCard.defaultProps = { number: 0, icon: null };

export default BackofficeCard;
