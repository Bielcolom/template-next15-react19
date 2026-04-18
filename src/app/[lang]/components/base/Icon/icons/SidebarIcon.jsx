import BaseIcon from "../BaseIcon";

const SidebarIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <rect
        x="2" y="3" width="20" height="18" rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="9" y1="3" x2="9" y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </BaseIcon>
  );
};

export default SidebarIcon;
