import PropTypes from "prop-types";

const BaseIcon = ({ children, className = "", ...props }) => {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {children}
    </svg>
  );
};

BaseIcon.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default BaseIcon;
