import PropTypes from "prop-types";
import styles from "./avatar.module.scss";

const PALETTE = [
  { bg: "#e6f0f1", fg: "#055058" },
  { bg: "#f5e9d6", fg: "#8a6525" },
  { bg: "#e8efe4", fg: "#3e6a3e" },
  { bg: "#f0e4e4", fg: "#8a3333" },
  { bg: "#e4e8f0", fg: "#334a8a" },
  { bg: "#f0e4ef", fg: "#7a337a" },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(name, fallback) {
  const source = (name || fallback || "?").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Avatar({ name, email, seed, size = 36 }) {
  const initials = getInitials(name, email);
  const hashSeed = seed || email || name || "default";
  const color = PALETTE[hashString(hashSeed) % PALETTE.length];

  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: color.bg,
        color: color.fg,
      }}
      aria-label={name || email}
    >
      {initials}
    </div>
  );
}

Avatar.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string,
  seed: PropTypes.string,
  size: PropTypes.number,
};
