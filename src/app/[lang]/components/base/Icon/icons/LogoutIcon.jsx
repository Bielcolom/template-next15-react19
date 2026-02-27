import BaseIcon from "../BaseIcon";

const LogoutIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polyline
        points="16 17 21 12 16 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <line
        x1="21"
        x2="9"
        y1="12"
        y2="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </BaseIcon>
  );
};

export default LogoutIcon;
