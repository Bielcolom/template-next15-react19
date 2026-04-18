import BaseIcon from "../BaseIcon";

const HomeIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <polyline
        points="9 22 9 12 15 12 15 22"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </BaseIcon>
  );
};

export default HomeIcon;
