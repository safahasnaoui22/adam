// components/DashboardIcons.tsx
// Professional line icons (24px grid, 1.8 stroke, rounded caps) used on the owner dashboard.
// Plain SVG: works in server and client components, inherits colour with `currentColor`.
import React from "react";

type IconProps = { size?: number; className?: string; strokeWidth?: number };

const base = (size: number, strokeWidth: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className,
  "aria-hidden": true,
});

export const IconUsers = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const IconUserPlus = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

export const IconStar = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconGem = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </svg>
);

export const IconGift = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

export const IconRepeat = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

export const IconTrendUp = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

export const IconTrendDown = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

export const IconMinus = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const IconCheckCircle = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconClock = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconAlertTriangle = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const IconBanknote = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export const IconBarChart = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export const IconActivity = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const IconShoppingBag = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export const IconInfo = ({ size = 16, strokeWidth = 2, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export const IconTrophy = ({ size = 22, strokeWidth = 1.8, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const IconLogOut = ({ size = 18, strokeWidth = 2, className }: IconProps) => (
  <svg {...base(size, strokeWidth, className)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
