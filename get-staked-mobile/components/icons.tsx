import { forwardRef } from "react";
import { G, Path, Svg } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
}

export const ArrowRight = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M5 12h14M12 5l7 7-7 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
);

export const ShieldCheck = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
);

export const Camera = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={2} />
    </Svg>
  )
);

export const Trophy = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M6 9H3v3a3 3 0 003 3h1m0-6h10m-10 0v6m0 0l-3 3m3-3h10m-10 0a3 3 0 01-3-3V9m13 6h1a3 3 0 003-3V9h-3m-1 6v6m0-6l3-3m-3 3h-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
);

export const Flame = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 2c0 5-2 7-2 7s-1-2-4-2c0 4 2 7 2 7s-1 2-1 5c0 2 2 4 4 4s4-2 4-4c0-3-1-5-1-5s2-3 2-7c-3 0-4 2-4 2s-2-2-2-7z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
);

export const Home = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M9 22V12h6v10" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
);

export const Users = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={2} />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
);

export const BarChart3 = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M3 3v18h18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 17V9M13 17V5M8 17v-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
);

export const Mic = forwardRef<SVGSVGElement, IconProps>(
  ({ size = 24, color = "currentColor", ...props }, ref) => (
    <Svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 10v2a7 7 0 01-14 0v-2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 19v4M8 23h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  )
);

const Circle = ({ cx, cy, r, ...props }: any) => (
  <Path
    d={`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`}
    {...props}
  />
);
