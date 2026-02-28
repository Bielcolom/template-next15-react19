import BaseIcon from "../BaseIcon";

const ExclamationIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="12"
        x2="12"
        y1="7.5"
        y2="12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </BaseIcon>
  );
};

export default ExclamationIcon;
