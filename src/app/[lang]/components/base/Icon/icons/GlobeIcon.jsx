import BaseIcon from "../BaseIcon";

const GlobeIcon = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="12" cy="12" rx="3.5" ry="9.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="2.5" y1="9" x2="21.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="2.5" y1="15" x2="21.5" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </BaseIcon>
);

export default GlobeIcon;
