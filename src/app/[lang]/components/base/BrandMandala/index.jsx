// handoff/src/app/[lang]/components/base/BrandMandala/index.jsx
// Mandala SVG que recrea el logo del estudio.
// Úsalo donde tenías <Image src="/logo/principal.png" />.

import PropTypes from "prop-types";

const RINGS = [
  { r: 5, n: 1, dot: 2.5 },
  { r: 13, n: 8, dot: 1.6 },
  { r: 22, n: 12, dot: 2 },
  { r: 32, n: 18, dot: 1.8 },
  { r: 42, n: 24, dot: 1.4 },
];

export default function BrandMandala({ size = 36, color = "#086972" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      {RINGS.flatMap((ring, i) => {
        if (ring.n === 1) {
          return [
            <circle key={`c-${i}`} r={ring.dot} fill={color} />,
          ];
        }
        return Array.from({ length: ring.n }).map((_, j) => {
          const a = (j / ring.n) * Math.PI * 2;
          return (
            <circle
              key={`${i}-${j}`}
              cx={Math.cos(a) * ring.r}
              cy={Math.sin(a) * ring.r}
              r={ring.dot}
              fill={color}
              opacity={1 - i * 0.1}
            />
          );
        });
      })}
    </svg>
  );
}

BrandMandala.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};
