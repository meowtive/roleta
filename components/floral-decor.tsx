function Gerbera({
  x,
  y,
  size,
  petal,
  heart,
  petals = 20,
  rotate = 0,
}: {
  x: number;
  y: number;
  size: number;
  petal: string;
  heart: string;
  petals?: number;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {Array.from({ length: petals }, (_, index) => (
        <ellipse
          key={`o-${index}`}
          cx="0"
          cy={-size * 0.64}
          rx={size * 0.15}
          ry={size * 0.46}
          fill={petal}
          transform={`rotate(${(index * 360) / petals})`}
        />
      ))}
      {Array.from({ length: petals }, (_, index) => (
        <ellipse
          key={`i-${index}`}
          cx="0"
          cy={-size * 0.4}
          rx={size * 0.09}
          ry={size * 0.28}
          fill={petal}
          opacity="0.9"
          transform={`rotate(${(index * 360) / petals + 8})`}
        />
      ))}
      <circle r={size * 0.22} fill={heart} />
      <circle r={size * 0.12} fill="#fff3c4" />
      <circle r={size * 0.05} fill="#f2c14b" />
    </g>
  );
}

function Daisy({
  x,
  y,
  size,
  rotate = 0,
}: {
  x: number;
  y: number;
  size: number;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {Array.from({ length: 12 }, (_, index) => (
        <ellipse
          key={index}
          cx="0"
          cy={-size * 0.5}
          rx={size * 0.13}
          ry={size * 0.36}
          fill="#fffdf9"
          transform={`rotate(${(index * 360) / 12})`}
        />
      ))}
      <circle r={size * 0.2} fill="#f2c14b" />
    </g>
  );
}

function Tulip({
  x,
  y,
  size,
  rotate = 0,
  color = "#f08a5a",
}: {
  x: number;
  y: number;
  size: number;
  rotate?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path
        d={`M0 ${size * 0.2}
           C ${-size * 0.5} ${size * 0.05}, ${-size * 0.38} ${-size * 0.85}, ${-size * 0.08} ${-size}
           L 0 ${-size * 0.55}
           L ${size * 0.08} ${-size}
           C ${size * 0.38} ${-size * 0.85}, ${size * 0.5} ${size * 0.05}, 0 ${size * 0.2} Z`}
        fill={color}
      />
      <path
        d={`M${-size * 0.02} ${size * 0.12} C ${-size * 0.16} ${-size * 0.15}, ${-size * 0.1} ${-size * 0.7}, 0 ${-size * 0.78}
           C ${size * 0.1} ${-size * 0.7}, ${size * 0.16} ${-size * 0.15}, ${size * 0.02} ${size * 0.12} Z`}
        fill="#fff6ee"
        opacity="0.32"
      />
    </g>
  );
}

function Rose({
  x,
  y,
  size,
  color,
  rotate = 0,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <ellipse rx={size * 0.78} ry={size * 0.66} fill={color} />
      <ellipse cx={-size * 0.12} cy={size * 0.06} rx={size * 0.42} ry={size * 0.36} fill="#fffdf9" opacity="0.22" />
      <ellipse cx={size * 0.08} cy={-size * 0.04} rx={size * 0.34} ry={size * 0.3} fill={color} />
      <circle r={size * 0.12} fill="#d46b86" opacity="0.65" />
    </g>
  );
}

function Leaf({
  x,
  y,
  size,
  rotate = 0,
  color = "#6b7a52",
}: {
  x: number;
  y: number;
  size: number;
  rotate?: number;
  color?: string;
}) {
  return (
    <path
      d={`M${x} ${y} C ${x - size * 0.38} ${y - size * 0.18}, ${x - size * 0.12} ${y - size}, ${x} ${y - size * 1.2}
         C ${x + size * 0.12} ${y - size}, ${x + size * 0.38} ${y - size * 0.18}, ${x} ${y} Z`}
      fill={color}
      transform={`rotate(${rotate} ${x} ${y})`}
    />
  );
}

function Stem({ d }: { d: string }) {
  return <path d={d} fill="none" stroke="#6b7a52" strokeWidth="2.4" strokeLinecap="round" />;
}

function Sprig({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d="M0 0 C 6 -20, 12 -36, 10 -58" fill="none" stroke="#8a9468" strokeWidth="1.7" />
      {[
        [10, -14, "#e28aa0"],
        [2, -24, "#f3b8c6"],
        [12, -34, "#e28aa0"],
        [3, -44, "#f6a3b8"],
        [11, -54, "#f3b8c6"],
      ].map(([cx, cy, fill]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill={String(fill)} />
      ))}
    </g>
  );
}

function Petals() {
  return (
    <>
      <span className="petal petal-a" />
      <span className="petal petal-b" />
      <span className="petal petal-c" />
      <span className="petal petal-d" />
    </>
  );
}

export function FloralDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block" aria-hidden="true">
      <Petals />

      <svg
        className="floral-sway absolute -left-10 -top-8 h-28 w-32 sm:-left-6 sm:-top-4 sm:h-96 sm:w-md"
        viewBox="0 0 420 340"
        fill="none"
      >
        <Leaf x={92} y={120} size={70} rotate={-42} color="#8a9468" />
        <Leaf x={180} y={86} size={52} rotate={16} color="#6b7a52" />
        <Leaf x={48} y={150} size={40} rotate={-70} color="#7d8a5e" />
        <Stem d="M36 36 C 110 78, 150 110, 190 170" />
        <Gerbera x={78} y={58} size={58} petal="#f4b3c4" heart="#e28aa0" rotate={-18} />
        <Gerbera x={158} y={46} size={48} petal="#ffd56a" heart="#f2c14b" rotate={14} />
        <Gerbera x={118} y={108} size={34} petal="#ffa35c" heart="#f08a5a" rotate={-8} />
        <Daisy x={208} y={88} size={20} rotate={18} />
        <Daisy x={42} y={108} size={16} rotate={-12} />
        <Daisy x={198} y={52} size={14} rotate={8} />
        <Rose x={168} y={118} size={20} color="#e28aa0" rotate={-10} />
        <Rose x={54} y={78} size={14} color="#f6a3b8" rotate={20} />
        <Gerbera x={232} y={70} size={22} petal="#f3b8c6" heart="#e28aa0" rotate={28} />
        <circle cx="236" cy="40" r="3.2" fill="#fffdf9" />
        <circle cx="252" cy="56" r="2.4" fill="#f3b8c6" />
        <circle cx="220" cy="28" r="2" fill="#f3b8c6" />
        <circle cx="268" cy="44" r="2" fill="#ffd56a" />
      </svg>

      <svg
        className="floral-sway-slow absolute -right-8 top-[22%] h-40 w-24 sm:-right-2 sm:top-[14%] sm:h-128 sm:w-72"
        viewBox="0 0 280 520"
        fill="none"
      >
        <Leaf x={168} y={230} size={78} rotate={18} color="#6b7a52" />
        <Leaf x={86} y={280} size={56} rotate={-32} color="#8a9468" />
        <Leaf x={210} y={320} size={44} rotate={40} color="#7d8a5e" />
        <Stem d="M176 36 C 168 140, 158 230, 140 360" />
        <Stem d="M176 120 C 130 170, 100 200, 78 230" />
        <Tulip x={176} y={92} size={62} rotate={6} color="#f08a5a" />
        <Gerbera x={118} y={168} size={46} petal="#ff9a4a" heart="#e86b3a" rotate={-14} />
        <Gerbera x={198} y={206} size={42} petal="#f3b8c6" heart="#e28aa0" rotate={18} />
        <Rose x={150} y={252} size={26} color="#e28aa0" />
        <Daisy x={84} y={214} size={18} rotate={-8} />
        <Gerbera x={214} y={278} size={26} petal="#ffd56a" heart="#f2c14b" rotate={22} />
        <Daisy x={168} y={318} size={16} />
        <Sprig x={92} y={300} rotate={-20} />
        <Sprig x={228} y={340} rotate={16} />
        <Gerbera x={96} y={248} size={20} petal="#f4b3c4" heart="#e28aa0" rotate={-26} />
        <Tulip x={232} y={150} size={34} rotate={18} color="#f3b8c6" />
        <circle cx="70" cy="188" r="2.4" fill="#fffdf9" />
        <circle cx="246" cy="168" r="2" fill="#f3b8c6" />
      </svg>

      <svg
        className="floral-sway absolute left-0 top-[42%] h-56 w-40"
        viewBox="0 0 200 280"
        fill="none"
      >
        <Leaf x={40} y={150} size={46} rotate={-50} color="#8a9468" />
        <Stem d="M30 220 C 50 160, 70 110, 90 70" />
        <Gerbera x={86} y={78} size={36} petal="#ffd56a" heart="#f2c14b" rotate={-12} />
        <Daisy x={48} y={118} size={16} />
        <Rose x={72} y={148} size={18} color="#e28aa0" />
        <Sprig x={28} y={168} rotate={-30} />
      </svg>

      <svg
        className="floral-sway absolute -bottom-8 -left-8 h-28 w-32 sm:bottom-0 sm:left-0 sm:h-64 sm:w-72"
        viewBox="0 0 300 230"
        fill="none"
      >
        <Leaf x={78} y={160} size={50} rotate={-28} />
        <Gerbera x={64} y={138} size={34} petal="#f3b8c6" heart="#e28aa0" rotate={-22} />
        <Daisy x={114} y={162} size={17} />
        <Rose x={92} y={186} size={16} color="#f6a3b8" />
        <Gerbera x={148} y={188} size={18} petal="#ffd56a" heart="#f2c14b" rotate={12} />
        <circle cx="176" cy="172" r="3" fill="#e28aa0" />
        <circle cx="190" cy="186" r="2.2" fill="#fffdf9" />
      </svg>

      <svg
        className="floral-sway-slow absolute -bottom-6 right-0 h-56 w-56"
        viewBox="0 0 240 220"
        fill="none"
      >
        <Leaf x={160} y={150} size={48} rotate={30} />
        <Gerbera x={168} y={118} size={32} petal="#f4b3c4" heart="#e28aa0" rotate={16} />
        <Gerbera x={124} y={150} size={24} petal="#ff9a4a" heart="#e86b3a" rotate={-10} />
        <Daisy x={196} y={156} size={16} rotate={12} />
        <Rose x={150} y={176} size={15} color="#f6a3b8" />
        <circle cx="210" cy="132" r="2.6" fill="#fffdf9" />
      </svg>
    </div>
  );
}
