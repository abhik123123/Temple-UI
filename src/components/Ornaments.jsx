import React from 'react';

/**
 * Line drawing of a Dravidian gopuram: stepped tiers rising to a barrel
 * vault crowned with kalasams. Uses currentColor so it can be tinted.
 */
export function Gopuram({ className, title }) {
  const tiers = [
    { y: 92, w: 84 },
    { y: 78, w: 72 },
    { y: 64, w: 60 },
    { y: 50, w: 48 },
    { y: 36, w: 38 },
  ];
  return (
    <svg
      className={className}
      viewBox="0 0 100 124"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* base wall and entrance */}
      <path d="M6 122 V106 H94 V122" />
      <path d="M41 122 V112 Q50 102 59 112 V122" />
      <line x1="2" y1="122" x2="98" y2="122" />
      {/* tiers */}
      {tiers.map(({ y, w }, i) => {
        const x = 50 - w / 2;
        return (
          <g key={y}>
            <path d={`M${x} ${y + 14} L${x + 3} ${y} H${x + w - 3} L${x + w} ${y + 14} Z`} />
            {/* niches */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={x + w * f} y1={y + 4} x2={x + w * f} y2={y + 11} strokeWidth="1.2" />
            ))}
            {i === 0 && <line x1={x - 2} y1={y + 14} x2={x + w + 2} y2={y + 14} />}
          </g>
        );
      })}
      {/* barrel vault (shala) */}
      <path d="M33 36 V30 Q33 22 50 22 Q67 22 67 30 V36" />
      {/* kalasams */}
      {[38, 44, 50, 56, 62].map((cx) => (
        <g key={cx}>
          <line x1={cx} y1="22" x2={cx} y2="16" strokeWidth="1.4" />
          <circle cx={cx} cy="13.5" r="2.4" strokeWidth="1.4" />
          <line x1={cx} y1="11" x2={cx} y2="7" strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}

/** Small brass oil lamp (deepam) used between section heading and text. */
export function Deepam({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 2c1.6 2.3 2.4 3.9 2.4 5.2A2.4 2.4 0 0 1 12 9.6a2.4 2.4 0 0 1-2.4-2.4C9.6 5.9 10.4 4.3 12 2z" />
      <path d="M3 12.5c2.2 0 4 .6 5.2 1.4h7.6c1.2-.8 3-1.4 5.2-1.4-.4 2.9-3.6 5-9 5s-8.6-2.1-9-5z" />
      <path d="M10 18.5h4l.8 2.5H9.2z" />
    </svg>
  );
}

export function SectionTitle({ title, children }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      <div className="deepam-divider"><Deepam /></div>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Kaavi() {
  return <div className="kaavi" aria-hidden="true" />;
}
