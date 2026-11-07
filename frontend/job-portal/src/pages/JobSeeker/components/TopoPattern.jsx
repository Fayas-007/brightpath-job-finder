// Decorative contour lines. Colour comes from the parent's text colour
// (set it with text-[...]/opacity on the className).
const BLOB =
  "M0,-100 C55,-105 105,-60 100,5 C95,70 45,105 -15,98 C-75,90 -110,40 -98,-20 C-88,-75 -45,-97 0,-100 Z";

// [centerX, centerY, ringCount, startScale, step, rotation]
const CLUSTERS = [
  [900, 140, 11, 0.35, 0.28, 12],
  [150, 470, 9, 0.3, 0.3, -9],
  [560, 330, 5, 0.25, 0.3, 5],
];

const TopoPattern = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 1200 600"
    preserveAspectRatio="xMidYMid slice"
    className={className}
  >
    <g fill="none" stroke="currentColor" strokeWidth="1.25">
      {CLUSTERS.flatMap(([cx, cy, count, start, step, rot], c) =>
        Array.from({ length: count }, (_, i) => (
          <path
            key={`${c}-${i}`}
            d={BLOB}
            vectorEffect="non-scaling-stroke"
            transform={`translate(${cx} ${cy}) rotate(${i * rot}) scale(${
              start + i * step
            })`}
          />
        ))
      )}
    </g>
  </svg>
);

export default TopoPattern;