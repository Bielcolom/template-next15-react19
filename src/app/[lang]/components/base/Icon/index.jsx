import PropTypes from "prop-types";
import { fallbackIcon, iconRegistry } from "./registry";

const Icon = ({ icon, className = "", ...props }) => {
  const iconKey = icon.trim().split(/\s+/)[0];
  const IconComponent = iconRegistry[iconKey] || fallbackIcon;

  return <IconComponent className={className} {...props} />;
};

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Icon;
