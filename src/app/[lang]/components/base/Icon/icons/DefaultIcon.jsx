import BaseIcon from "../BaseIcon";

const DefaultIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 15l2.5-3 2.5 2 3-4 2 3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </BaseIcon>
  );
};

export default DefaultIcon;
