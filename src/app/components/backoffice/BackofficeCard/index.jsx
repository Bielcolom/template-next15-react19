import PropTypes from "prop-types";
import styles from "./backofficeCard.module.scss";

const BackofficeCard = ({
    text,
    number,
    icon,
}) => {
    return (
        <div className={styles.backofficeClient}>
            <span className={styles.text}>{text}</span>
            {icon && <span className={styles.icon}>{icon}</span>}
            <span className={styles.number}>{number}</span>
        </div>
    );
};

BackofficeCard.propTypes = {
    text: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    icon: PropTypes.node,
};

BackofficeCard.defaultProps = {
    number: 0,
    icon: null,
};

export default BackofficeCard;