import PropTypes from "prop-types";
import styles from "./pageTitle.module.scss";

export default function PageTitle({ title, subtitle }) {
  return (
    <div className={styles.titleBlock}>
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

PageTitle.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
};
