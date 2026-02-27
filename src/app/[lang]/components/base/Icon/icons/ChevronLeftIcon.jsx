import BaseIcon from "../BaseIcon";

const ChevronLeftIcon = (props) => {
  return (
    <BaseIcon {...props}>
      <polyline
        points="15 18 9 12 15 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </BaseIcon>
  );
};

export default ChevronLeftIcon;
