import PropTypes from "prop-types";
import styles from "./badge.module.scss";

const VARIANTS = ["success", "warn", "danger", "neutral", "primary", "dark"];

export default function Badge({ children, variant = "neutral", dot = true }) {
  const v = VARIANTS.includes(variant) ? variant : "neutral";
  return (
    <span className={`${styles.badge} ${styles[v]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(VARIANTS),
  dot: PropTypes.bool,
};
