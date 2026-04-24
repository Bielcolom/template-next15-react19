"use client";

import PropTypes from "prop-types";
import styles from "./tabs.module.scss";

const Tabs = ({ tabs, activeTab, onChange }) => (
  <div className={styles.wrapper}>
    <div className={styles.tabList} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          aria-selected={activeTab === tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div className={styles.indicator} />
  </div>
);

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Tabs;
